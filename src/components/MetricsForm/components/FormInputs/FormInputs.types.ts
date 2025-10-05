export interface FormInputsProps {
  org: string
  repo: string
  team: string
  dateRange: [Date | null, Date | null]
  token: string
  storeToken: boolean
  isLoading: boolean
  onOrgChange: (value: string) => void
  onRepoChange: (value: string) => void
  onTeamChange: (value: string) => void
  onDateRangeChange: (value: [Date | null, Date | null]) => void
  onTokenChange: (value: string) => void
  onStoreTokenChange: (checked: boolean) => void
  onCancel: () => void
}

