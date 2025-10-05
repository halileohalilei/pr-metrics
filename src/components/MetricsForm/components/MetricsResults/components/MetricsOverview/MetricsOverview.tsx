'use client'

import { Card, Grid, Stack, Text } from '@mantine/core'
import { metricsCardStyle } from '../../../../MetricsForm.styles'
import { MetricsOverviewProps } from './MetricsOverview.types'

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder style={metricsCardStyle}>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.totalPRs}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Total PRs
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.openPRs}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Open
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.mergedPRs}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Merged
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.closedPRs}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Closed
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.totalReviews}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Total Reviews
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.totalComments}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Total Comments
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
          <Stack align="center" gap={4}>
            <Text size="xl" fw={700} c="white">
              {metrics.reviewers.length}
            </Text>
            <Text size="sm" c="white" opacity={0.9}>
              Reviewers{metrics.teamFilter ? ' (Team)' : ''}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  )
}

