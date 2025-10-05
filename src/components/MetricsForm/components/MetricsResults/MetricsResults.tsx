'use client'

import { Stack, Title, Loader, Alert, Text, Group } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { MetricsOverview } from './components/MetricsOverview'
import { ReviewTiming } from './components/ReviewTiming'
import { ReviewDistribution } from './components/ReviewDistribution'
import { ReviewersTable } from './components/ReviewersTable'
import { MetricsResultsProps } from './MetricsResults.types'

export function MetricsResults({ isPending, isSuccess, error, data, org, repo }: MetricsResultsProps) {
  if (isPending) {
    return (
      <Group justify="center" mt="xl">
        <Stack align="center" gap="sm">
          <Loader size="lg" type="bars" />
          <Text c="dimmed">Fetching PR reviews via GraphQL...</Text>
        </Stack>
      </Group>
    )
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="md">
        {error}
      </Alert>
    )
  }

  if (isSuccess && data) {
    return (
      <Stack gap="xl" mt="xl">
        <Title order={2} ta="center">
          PR Review Metrics
        </Title>

        <MetricsOverview metrics={data} />

        <ReviewTiming timing={data.timing} />

        <ReviewDistribution distribution={data.distribution} />

        <Title order={3} size="h4" mt="md">
          👥 Reviewers
        </Title>

        <ReviewersTable reviewers={data.reviewers} org={org} repo={repo} />
      </Stack>
    )
  }

  return null
}

