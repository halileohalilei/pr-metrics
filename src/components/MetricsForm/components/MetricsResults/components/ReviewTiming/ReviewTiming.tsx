'use client'

import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { formatHours } from '@/lib/utils/format'
import { ReviewTimingProps } from './ReviewTiming.types'

export function ReviewTiming({ timing }: ReviewTimingProps) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} size="h4" mb="md">
        ⏱️ Review Timing
      </Title>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Time to First Review (avg)
          </Text>
          <Text size="sm" fw={600}>
            {formatHours(timing.timeToFirstReview.average)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Time to First Review (median)
          </Text>
          <Text size="sm" fw={600}>
            {formatHours(timing.timeToFirstReview.median)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Time to Merge (avg)
          </Text>
          <Text size="sm" fw={600}>
            {formatHours(timing.timeToMerge.average)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Time to Merge (median)
          </Text>
          <Text size="sm" fw={600}>
            {formatHours(timing.timeToMerge.median)}
          </Text>
        </Group>
      </Stack>
    </Card>
  )
}

