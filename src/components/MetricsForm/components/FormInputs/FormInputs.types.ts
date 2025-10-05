export interface FormInputsProps {
  org: string
  repo: string
  team: string
  numDays: string
  startDate: string
  endDate: string
  token: string
  storeToken: boolean
  isLoading: boolean
  onOrgChange: (value: string) => void
  onRepoChange: (value: string) => void
  onTeamChange: (value: string) => void
  onNumDaysChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onTokenChange: (value: string) => void
  onStoreTokenChange: (checked: boolean) => void
}

