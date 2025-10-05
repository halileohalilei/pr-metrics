'use client'

import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { ReviewDistributionProps } from './ReviewDistribution.types'

export function ReviewDistribution({ distribution }: ReviewDistributionProps) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} size="h4" mb="md">
        📈 Review Distribution
      </Title>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Reviews per PR (avg)
          </Text>
          <Text size="sm" fw={600}>
            {distribution.reviewsPerPR.average.toFixed(1)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Reviews per PR (median)
          </Text>
          <Text size="sm" fw={600}>
            {distribution.reviewsPerPR.median.toFixed(1)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Approvals before merge (avg)
          </Text>
          <Text size="sm" fw={600}>
            {distribution.approvalsBeforeMerge.average.toFixed(1)}
          </Text>
        </Group>
      </Stack>
    </Card>
  )
}

