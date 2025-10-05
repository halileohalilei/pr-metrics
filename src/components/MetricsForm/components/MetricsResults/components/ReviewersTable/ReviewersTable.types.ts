import { ReviewerMetric } from '@/lib/github'

export interface ReviewersTableProps {
  reviewers: ReviewerMetric[]
  org: string
  repo: string
}

