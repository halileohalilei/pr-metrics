import { PullRequest, PRMetrics, ReviewerMetric } from '../github.types'
import { average, median, getHoursDiff } from '../utils/statistics'

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

