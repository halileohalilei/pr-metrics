'use client'

import { useState } from 'react'
import { DatePickerInput } from '@mantine/dates'
import { Button, Group, Stack, Text, Popover } from '@mantine/core'
import { IconCalendar } from '@tabler/icons-react'
import { DateRangePickerProps, QuickSelectOption } from './DateRangePicker.types'

const quickOptions: QuickSelectOption[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 180 days', days: 180 },
  { label: 'Last year', days: 365 },
]

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [opened, setOpened] = useState(false)

  const handleQuickSelect = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    onChange([startDate, endDate])
    setOpened(false)
  }

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    onChange(dates)
  }

  return (
    <Popover 
      opened={opened} 
      onChange={setOpened} 
      position="bottom-start" 
      width="target" 
      withArrow 
      shadow="md"
      closeOnClickOutside
      closeOnEscape
    >
      <Popover.Target>
        <div onClick={() => setOpened((o) => !o)} style={{ cursor: 'pointer' }}>
          <DatePickerInput
            type="range"
            label="Date Range"
            placeholder="Select date range or quick option"
            value={value}
            onChange={handleDateChange}
            leftSection={<IconCalendar size={14} />}
            size="sm"
            valueFormat="MMM DD, YYYY"
            readOnly
            styles={{
              input: {
                cursor: 'pointer',
              },
            }}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()}>
        <Stack gap="xs">
          <Text size="xs" fw={500} c="dimmed">
            Quick Selection
          </Text>
          <Group gap="xs">
            {quickOptions.map((option) => (
              <Button
                key={option.days}
                size="xs"
                variant="light"
                onClick={() => handleQuickSelect(option.days)}
              >
                {option.label}
              </Button>
            ))}
          </Group>
          <Text size="xs" fw={500} c="dimmed" mt="xs">
            Custom Range
          </Text>
          <DatePickerInput
            type="range"
            placeholder="Pick dates range"
            value={value}
            onChange={handleDateChange}
            size="sm"
            popoverProps={{ withinPortal: false }}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

