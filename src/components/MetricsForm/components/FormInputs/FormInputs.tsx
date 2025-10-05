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
    <Stack gap="md">
      <TextInput
        label="Organization Name"
        name="org"
        placeholder="e.g., facebook"
        required
        value={org}
        onChange={(e) => onOrgChange(e.target.value)}
        leftSection={<IconBrandGithub size={16} />}
      />

      <TextInput
        label="Repository Name"
        name="repo"
        placeholder="e.g., react"
        required
        value={repo}
        onChange={(e) => onRepoChange(e.target.value)}
        leftSection={<IconBrandGithub size={16} />}
      />

      <PasswordInput
        label="GitHub Token"
        name="token"
        placeholder="Your GitHub personal access token"
        required
        description="Token needs 'repo' and 'read:org' scopes"
      />

      <div>
        <Text size="sm" fw={500} mb="xs">
          Date Range
        </Text>
        <Group grow align="flex-start" mb="xs">
          <TextInput
            label="From"
            type="date"
            name="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            leftSection={<IconCalendar size={16} />}
          />
          <TextInput
            label="To"
            type="date"
            name="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            leftSection={<IconCalendar size={16} />}
          />
        </Group>

        <Divider label="OR" labelPosition="center" my="md" />

        <NumberInput
          label="Number of Days (from today)"
          name="numDays"
          placeholder="e.g., 30"
          min={1}
          value={numDays}
          onChange={(value) => onNumDaysChange(String(value))}
          leftSection={<IconCalendar size={16} />}
        />
      </div>

      <TextInput
        label="Team Name (optional)"
        name="team"
        placeholder="e.g., frontend-team"
        description="Filter reviewers by team name. Leave empty to show all reviewers."
        value={team}
        onChange={(e) => onTeamChange(e.target.value)}
        leftSection={<IconUsers size={16} />}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isLoading}
        gradient={{ from: 'violet', to: 'grape', deg: 135 }}
        variant="gradient"
      >
        See Metrics
      </Button>
    </Stack>
  )
}

