import { PRMetrics } from '@/lib/github'

export interface MetricsResultsProps {
  isPending: boolean
  isSuccess: boolean
  error: string
  data: PRMetrics | undefined
  org: string
  repo: string
  dateRange: [Date | null, Date | null]
}

