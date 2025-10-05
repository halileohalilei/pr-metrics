import { GraphQLClient } from 'graphql-request'
import { PullRequest } from '../github.types'
import { FETCH_PRS_QUERY } from '../queries/fetch-pull-requests.query'
import { retryWithBackoff, delay } from '../utils/retry'

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

