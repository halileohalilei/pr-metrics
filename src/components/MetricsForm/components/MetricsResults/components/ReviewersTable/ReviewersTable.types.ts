import { ReviewerMetric } from '@/lib/github'

export interface ReviewersTableProps {
  reviewers: ReviewerMetric[]
  org: string
  repo: string
}

export type SortColumn = 
  | 'name'
  | 'totalReviews'
  | 'uniquePRs'
  | 'approved'
  | 'changesRequested'
  | 'commented'
  | 'dismissed'
  | 'pending'

export type SortDirection = 'asc' | 'desc'

export type SortMode = 'count' | 'percentage'

