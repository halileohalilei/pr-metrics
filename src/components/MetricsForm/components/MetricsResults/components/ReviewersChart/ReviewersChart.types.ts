import { ReviewerMetric } from '@/lib/github'

export interface ReviewersChartProps {
  reviewers: ReviewerMetric[]
}

export type SortMetric = 
  | 'totalReviews' 
  | 'approved' 
  | 'changesRequested' 
  | 'commented' 
  | 'dismissed' 
  | 'pending'
  | 'approvedPct'
  | 'changesRequestedPct'
  | 'commentedPct'
  | 'dismissedPct'
  | 'pendingPct'

