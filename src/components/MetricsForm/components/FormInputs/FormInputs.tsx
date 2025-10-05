'use client'

import { TextInput, PasswordInput, Button, Group, Stack, Divider, Text, NumberInput } from '@mantine/core'
import { IconBrandGithub, IconCalendar, IconUsers } from '@tabler/icons-react'
import { FormInputsProps } from './FormInputs.types'

export function FormInputs({
  org,
  repo,
  team,
  numDays,
  startDate,
  endDate,
  isLoading,
  onOrgChange,
  onRepoChange,
  onTeamChange,
  onNumDaysChange,
  onStartDateChange,
  onEndDateChange,
}: FormInputsProps) {
  return (
    <Stack gap="sm">
      <TextInput
        label="Organization"
        name="org"
        placeholder="e.g., facebook"
        required
        value={org}
        onChange={(e) => onOrgChange(e.target.value)}
        leftSection={<IconBrandGithub size={14} />}
        size="sm"
      />

      <TextInput
        label="Repository"
        name="repo"
        placeholder="e.g., react"
        required
        value={repo}
        onChange={(e) => onRepoChange(e.target.value)}
        leftSection={<IconBrandGithub size={14} />}
        size="sm"
      />

      <PasswordInput
        label="GitHub Token"
        name="token"
        placeholder="Token with repo & read:org scopes"
        required
        size="sm"
      />

      <div>
        <Text size="xs" fw={500} mb={4}>
          Date Range
        </Text>
        <Group grow align="flex-start" mb={4}>
          <TextInput
            label="From"
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            leftSection={<IconCalendar size={14} />}
            size="sm"
          />
          <TextInput
            label="To"
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            leftSection={<IconCalendar size={14} />}
            size="sm"
          />
        </Group>

        <Divider label="OR" labelPosition="center" my="xs" />

        <NumberInput
          label="Number of Days"
          name="numDays"
          placeholder="e.g., 30"
          min={1}
          value={numDays}
          onChange={(value) => onNumDaysChange(String(value))}
          leftSection={<IconCalendar size={14} />}
          size="sm"
        />
      </div>

      <TextInput
        label="Team (optional)"
        name="team"
        placeholder="e.g., frontend-team"
        value={team}
        onChange={(e) => onTeamChange(e.target.value)}
        leftSection={<IconUsers size={14} />}
        size="sm"
      />

      <Button
        type="submit"
        fullWidth
        size="md"
        loading={isLoading}
        gradient={{ from: 'violet', to: 'grape', deg: 135 }}
        variant="gradient"
        mt="xs"
      >
        Get Metrics
      </Button>
    </Stack>
  )
}

