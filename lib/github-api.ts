import { GraphQLClient, gql } from 'graphql-request'

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

export function createGitHubClient(token: string) {
  return new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
}

export interface PullRequest {
  number: number
  title: string
  state: string
  createdAt: string
  mergedAt: string | null
  closedAt: string | null
  updatedAt: string
  author: {
    login: string
  } | null
  reviews: {
    totalCount: number
    nodes: Array<{
      author: {
        login: string
      } | null
      state: string
      createdAt: string
      submittedAt: string | null
    }>
  }
  reviewRequests: {
    totalCount: number
  }
  comments: {
    totalCount: number
  }
  timelineItems: {
    nodes: Array<{
      __typename: string
      createdAt?: string
    }>
  }
}

export interface ReviewerMetric {
  name: string
  totalReviews: number
  approved: number
  changesRequested: number
  commented: number
  dismissed: number
  pending: number
  uniquePRs: number
}

export interface PRMetrics {
  reviewers: ReviewerMetric[]
  totalPRs: number
  openPRs: number
  closedPRs: number
  mergedPRs: number
  totalReviews: number
  totalComments: number
  teamFilter: string
  timing: {
    timeToFirstReview: {
      average: number
      median: number
    }
    timeToMerge: {
      average: number
      median: number
    }
  }
  distribution: {
    reviewsPerPR: {
      average: number
      median: number
    }
    approvalsBeforeMerge: {
      average: number
    }
  }
}

// GraphQL query to fetch pull requests with reviews
export const FETCH_PRS_QUERY = gql`
  query FetchPullRequests($owner: String!, $repo: String!, $cursor: String, $limit: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequests(first: $limit, after: $cursor, orderBy: { field: CREATED_AT, direction: DESC }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          state
          createdAt
          mergedAt
          closedAt
          updatedAt
          author {
            login
          }
          reviews(first: 50) {
            totalCount
            nodes {
              author {
                login
              }
              state
              createdAt
              submittedAt
            }
          }
          reviewRequests(first: 10) {
            totalCount
          }
          comments {
            totalCount
          }
          timelineItems(first: 50, itemTypes: [REVIEW_REQUESTED_EVENT, READY_FOR_REVIEW_EVENT]) {
            nodes {
              __typename
              ... on ReadyForReviewEvent {
                createdAt
              }
              ... on ReviewRequestedEvent {
                createdAt
              }
            }
          }
        }
      }
    }
  }
`

// GraphQL query to fetch team members
export const FETCH_TEAM_MEMBERS_QUERY = gql`
  query FetchTeamMembers($org: String!, $teamSlug: String!, $cursor: String) {
    organization(login: $org) {
      team(slug: $teamSlug) {
        members(first: 100, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            login
          }
        }
      }
    }
  }
`

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on auth or not found errors
      if (error.response?.errors?.[0]?.type === 'NOT_FOUND' || 
          error.response?.status === 401) {
        throw error
      }
      
      // Check for rate limit or timeout errors
      const isRateLimitError = error.response?.status === 429
      const isTimeoutError = error.response?.status === 502 || 
                            error.response?.status === 504 ||
                            error.message?.includes('timeout')
      
      if ((isRateLimitError || isTimeoutError) && attempt < maxRetries - 1) {
        const delayTime = initialDelay * Math.pow(2, attempt)
        console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delayTime}ms...`)
        await delay(delayTime)
        continue
      }
      
      throw error
    }
  }
  
  throw lastError!
}

export async function fetchAllPullRequests(
  client: GraphQLClient,
  owner: string,
  repo: string,
  since: Date,
  until: Date
): Promise<PullRequest[]> {
  const allPRs: PullRequest[] = []
  let hasNextPage = true
  let cursor: string | null = null
  const batchSize = 50 // Reduced from 100 to avoid timeouts
  let batchCount = 0

  console.log(`Fetching PRs from ${owner}/${repo}...`)

  while (hasNextPage) {
    try {
      batchCount++
      const data: any = await retryWithBackoff(async () => {
        return await client.request(FETCH_PRS_QUERY, {
          owner,
          repo,
          cursor,
          limit: batchSize,
        })
      })

      const prs = data.repository.pullRequests.nodes
      const pageInfo = data.repository.pullRequests.pageInfo

      // Filter PRs by date range (based on createdAt)
      const filteredPRs = prs.filter((pr: PullRequest) => {
        const createdAt = new Date(pr.createdAt)
        return createdAt >= since && createdAt <= until
      })

      allPRs.push(...filteredPRs)
      console.log(`Fetched batch ${batchCount}: ${allPRs.length} PRs in date range`)

      // If the last PR is before our date range, stop pagination
      if (prs.length > 0) {
        const lastPRDate = new Date(prs[prs.length - 1].createdAt)
        if (lastPRDate < since) {
          console.log('Reached PRs outside date range, stopping...')
          break
        }
      }

      hasNextPage = pageInfo.hasNextPage
      cursor = pageInfo.endCursor
      
      // Add a small delay between requests to avoid rate limiting
      if (hasNextPage) {
        await delay(500)
      }
    } catch (error: any) {
      if (error.response?.errors?.[0]?.type === 'NOT_FOUND') {
        throw new Error('Repository not found. Please check organization and repository names.')
      } else if (error.response?.status === 401) {
        throw new Error('Invalid GitHub token. Please check your token.')
      } else if (error.response?.status === 502 || error.response?.status === 504) {
        throw new Error('GitHub API timeout. Try reducing the date range or the repository has too many PRs.')
      }
      throw new Error(`GitHub API error: ${error.message}`)
    }
  }

  return allPRs
}

export async function fetchTeamMembers(
  client: GraphQLClient,
  org: string,
  teamSlug: string
): Promise<string[]> {
  try {
    const allMembers: string[] = []
    let hasNextPage = true
    let cursor: string | null = null

    console.log(`Fetching team members from ${org}/${teamSlug}...`)

    while (hasNextPage) {
      const data: any = await retryWithBackoff(async () => {
        return await client.request(FETCH_TEAM_MEMBERS_QUERY, {
          org,
          teamSlug,
          cursor,
        })
      })

      if (!data.organization?.team) {
        console.warn('Team not found. Showing all reviewers.')
        return []
      }

      const members = data.organization.team.members.nodes
      const pageInfo = data.organization.team.members.pageInfo

      allMembers.push(...members.map((member: any) => member.login))

      hasNextPage = pageInfo.hasNextPage
      cursor = pageInfo.endCursor
      
      // Add a small delay between requests
      if (hasNextPage) {
        await delay(500)
      }
    }

    console.log(`Found ${allMembers.length} team members`)
    return allMembers
  } catch (error) {
    console.warn('Failed to fetch team members. Showing all reviewers.')
    return []
  }
}

// Helper functions for statistics
function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function getHoursDiff(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
}

export async function calculateMetrics(
  prs: PullRequest[],
  since: Date,
  until: Date,
  teamMembers: string[]
): Promise<PRMetrics> {
  const reviewerMetrics: { [key: string]: any } = {}
  let totalReviews = 0
  let totalComments = 0
  let openPRs = 0
  let closedPRs = 0
  let mergedPRs = 0
  const timeToFirstReview: number[] = []
  const timeToMerge: number[] = []
  const reviewsPerPR: number[] = []
  const approvalsBeforeMerge: number[] = []

  for (const pr of prs) {
    // Count PR states
    if (pr.state === 'OPEN') openPRs++
    if (pr.state === 'CLOSED') closedPRs++
    if (pr.state === 'MERGED') mergedPRs++

    // Count reviews and comments
    totalReviews += pr.reviews.totalCount
    totalComments += pr.comments.totalCount
    reviewsPerPR.push(pr.reviews.totalCount)

    // Calculate time to first review
    const submittedReviews = pr.reviews.nodes.filter((r) => r.submittedAt)
    if (submittedReviews.length > 0) {
      const firstReview = submittedReviews.sort(
        (a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime()
      )[0]

      // Use ready for review time if available, otherwise use creation time
      const readyForReviewEvent = pr.timelineItems.nodes.find(
        (item) => item.__typename === 'ReadyForReviewEvent'
      )
      const startTime = readyForReviewEvent ? readyForReviewEvent.createdAt! : pr.createdAt

      const hours = getHoursDiff(startTime, firstReview.submittedAt!)
      timeToFirstReview.push(hours)
    }

    // Calculate time to merge
    if (pr.mergedAt) {
      const hours = getHoursDiff(pr.createdAt, pr.mergedAt)
      timeToMerge.push(hours)

      // Count approvals before merge
      const approvals = pr.reviews.nodes.filter((r) => r.state === 'APPROVED')
      approvalsBeforeMerge.push(approvals.length)
    }

    // Track reviewers (excluding self-reviews)
    for (const review of pr.reviews.nodes) {
      if (review.author && review.author.login !== pr.author?.login) {
        const reviewer = review.author.login

        if (!reviewerMetrics[reviewer]) {
          reviewerMetrics[reviewer] = {
            name: reviewer,
            totalReviews: 0,
            approved: 0,
            changesRequested: 0,
            commented: 0,
            dismissed: 0,
            pending: 0,
            prsReviewed: new Set(),
          }
        }

        reviewerMetrics[reviewer].totalReviews++
        reviewerMetrics[reviewer].prsReviewed.add(pr.number)

        if (review.state === 'APPROVED') reviewerMetrics[reviewer].approved++
        if (review.state === 'CHANGES_REQUESTED') reviewerMetrics[reviewer].changesRequested++
        if (review.state === 'COMMENTED') reviewerMetrics[reviewer].commented++
        if (review.state === 'DISMISSED') reviewerMetrics[reviewer].dismissed++
        if (review.state === 'PENDING') reviewerMetrics[reviewer].pending++
      }
    }
  }

  // Filter by team if specified
  let filteredMetrics = Object.values(reviewerMetrics)
  if (teamMembers.length > 0) {
    filteredMetrics = filteredMetrics.filter((metric: any) =>
      teamMembers.includes(metric.name)
    )
  }

  // Convert Set to count
  filteredMetrics.forEach((metric: any) => {
    metric.uniquePRs = metric.prsReviewed.size
    delete metric.prsReviewed
  })

  // Sort by total reviews
  filteredMetrics.sort((a: any, b: any) => b.totalReviews - a.totalReviews)

  return {
    reviewers: filteredMetrics as ReviewerMetric[],
    totalPRs: prs.length,
    openPRs,
    closedPRs,
    mergedPRs,
    totalReviews,
    totalComments,
    teamFilter: teamMembers.length > 0 ? 'filtered' : '',
    timing: {
      timeToFirstReview: {
        average: average(timeToFirstReview),
        median: median(timeToFirstReview),
      },
      timeToMerge: {
        average: average(timeToMerge),
        median: median(timeToMerge),
      },
    },
    distribution: {
      reviewsPerPR: {
        average: average(reviewsPerPR),
        median: median(reviewsPerPR),
      },
      approvalsBeforeMerge: {
        average: average(approvalsBeforeMerge),
      },
    },
  }
}

