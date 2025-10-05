export interface FetchMetricsParams {
  org: string
  repo: string
  token: string
  since: Date
  until: Date
  team: string
}

export interface FormState {
  org: string
  repo: string
  team: string
  numDays: string
  startDate: string
  endDate: string
  token?: string
  storeToken?: boolean
}

