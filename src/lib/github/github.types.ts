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
        name: string | null
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
  login: string
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

