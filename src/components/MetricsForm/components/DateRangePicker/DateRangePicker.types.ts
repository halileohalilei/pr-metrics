export interface DateRangePickerProps {
  value: [Date | null, Date | null]
  onChange: (value: [Date | null, Date | null]) => void
}

export interface QuickSelectOption {
  label: string
  days: number
}

