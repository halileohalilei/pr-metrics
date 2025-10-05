'use client'

import { TextInput, PasswordInput, Button, Stack, Checkbox, Group } from '@mantine/core'
import { IconBrandGithub, IconUsers, IconX } from '@tabler/icons-react'
import { FormInputsProps } from './FormInputs.types'
import { DateRangePicker } from '../DateRangePicker'

export function FormInputs({
  org,
  repo,
  team,
  dateRange,
  token,
  storeToken,
  isLoading,
  onOrgChange,
  onRepoChange,
  onTeamChange,
  onDateRangeChange,
  onTokenChange,
  onStoreTokenChange,
  onCancel,
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

      <div>
        <PasswordInput
          label="GitHub Token"
          name="token"
          placeholder="Token with repo & read:org scopes"
          required
          size="sm"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
        />
        <Checkbox
          label="Store token locally"
          size="xs"
          mt={6}
          checked={storeToken}
          onChange={(e) => onStoreTokenChange(e.currentTarget.checked)}
        />
      </div>

      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

      <TextInput
        label="Team (optional)"
        name="team"
        placeholder="e.g., frontend-team"
        value={team}
        onChange={(e) => onTeamChange(e.target.value)}
        leftSection={<IconUsers size={14} />}
        size="sm"
      />

      {isLoading ? (
        <Group gap="xs" mt="xs">
          <Button
            type="submit"
            style={{ flex: 1 }}
            size="md"
            loading={isLoading}
            gradient={{ from: 'violet', to: 'grape', deg: 135 }}
            variant="gradient"
          >
            Get Metrics
          </Button>
          <Button
            type="button"
            size="md"
            color="red"
            variant="light"
            onClick={onCancel}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>
        </Group>
      ) : (
        <Button
          type="submit"
          fullWidth
          size="md"
          gradient={{ from: 'violet', to: 'grape', deg: 135 }}
          variant="gradient"
          mt="xs"
        >
          Get Metrics
        </Button>
      )}
    </Stack>
  )
}

