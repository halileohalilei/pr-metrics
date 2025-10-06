'use client'

import { Stack, Title, Loader, Alert, Text, Group } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { MetricsOverview } from './components/MetricsOverview'
import { ReviewTiming } from './components/ReviewTiming'
import { ReviewDistribution } from './components/ReviewDistribution'
import { ReviewersTable } from './components/ReviewersTable'
import { ReviewersChart } from './components/ReviewersChart'
import { MetricsResultsProps } from './MetricsResults.types'
import { formatDateRange } from '@/lib/utils/format'

export function MetricsResults({ isPending, isSuccess, error, data, org, repo, dateRange }: MetricsResultsProps) {
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
    const dateRangeText = formatDateRange(dateRange[0], dateRange[1])

    return (
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={2} size="h2">
            📊 Results
          </Title>
          {dateRangeText && (
            <Text size="sm" c="dimmed">
              {dateRangeText}
            </Text>
          )}
        </Stack>

        <ReviewersChart reviewers={data.reviewers} />

        <ReviewersTable reviewers={data.reviewers} org={org} repo={repo} />

        <Title order={3} size="h4" mt="md">
          📈 Statistics
        </Title>

        <MetricsOverview metrics={data} />

        <ReviewTiming timing={data.timing} />

        <ReviewDistribution distribution={data.distribution} />
      </Stack>
    )
  }

  return null
}

