'use client'

import { Card, Title, Text, Stack, Select, Group } from '@mantine/core'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ReviewersChartProps, SortMetric } from './ReviewersChart.types'

export function ReviewersChart({ reviewers }: ReviewersChartProps) {
  const [sortBy, setSortBy] = useState<SortMetric>('totalReviews')

  if (reviewers.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No reviewers found to display chart.
      </Text>
    )
  }

  const chartData = reviewers
    .sort((a, b) => {
      let aValue = 0
      let bValue = 0

      switch (sortBy) {
        case 'totalReviews':
          aValue = a.totalReviews
          bValue = b.totalReviews
          break
        case 'approved':
          aValue = a.approved
          bValue = b.approved
          break
        case 'changesRequested':
          aValue = a.changesRequested
          bValue = b.changesRequested
          break
        case 'commented':
          aValue = a.commented
          bValue = b.commented
          break
        case 'dismissed':
          aValue = a.dismissed
          bValue = b.dismissed
          break
        case 'pending':
          aValue = a.pending
          bValue = b.pending
          break
        case 'approvedPct':
          aValue = a.totalReviews > 0 ? (a.approved / a.totalReviews) * 100 : 0
          bValue = b.totalReviews > 0 ? (b.approved / b.totalReviews) * 100 : 0
          break
        case 'changesRequestedPct':
          aValue = a.totalReviews > 0 ? (a.changesRequested / a.totalReviews) * 100 : 0
          bValue = b.totalReviews > 0 ? (b.changesRequested / b.totalReviews) * 100 : 0
          break
        case 'commentedPct':
          aValue = a.totalReviews > 0 ? (a.commented / a.totalReviews) * 100 : 0
          bValue = b.totalReviews > 0 ? (b.commented / b.totalReviews) * 100 : 0
          break
        case 'dismissedPct':
          aValue = a.totalReviews > 0 ? (a.dismissed / a.totalReviews) * 100 : 0
          bValue = b.totalReviews > 0 ? (b.dismissed / b.totalReviews) * 100 : 0
          break
        case 'pendingPct':
          aValue = a.totalReviews > 0 ? (a.pending / a.totalReviews) * 100 : 0
          bValue = b.totalReviews > 0 ? (b.pending / b.totalReviews) * 100 : 0
          break
      }

      return bValue - aValue
    })
    .map((reviewer) => ({
      name: reviewer.name,
      Approved: reviewer.approved,
      'Changes Requested': reviewer.changesRequested,
      Commented: reviewer.commented,
      Dismissed: reviewer.dismissed,
      Pending: reviewer.pending,
    }))

  // Calculate dynamic height based on number of reviewers
  const chartHeight = Math.max(450, reviewers.length * 30)

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={4}>Review Status Distribution by Reviewer</Title>
          
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(value) => setSortBy(value as SortMetric)}
            data={[
              { group: 'Count', items: [
                { value: 'totalReviews', label: 'Total Reviews' },
                { value: 'approved', label: 'Approved' },
                { value: 'changesRequested', label: 'Changes Requested' },
                { value: 'commented', label: 'Commented' },
                { value: 'dismissed', label: 'Dismissed' },
                { value: 'pending', label: 'Pending' },
              ]},
              { group: 'Percentage', items: [
                { value: 'approvedPct', label: 'Approved %' },
                { value: 'changesRequestedPct', label: 'Changes Requested %' },
                { value: 'commentedPct', label: 'Commented %' },
                { value: 'dismissedPct', label: 'Dismissed %' },
                { value: 'pendingPct', label: 'Pending %' },
              ]},
            ]}
            w={230}
          />
        </Group>

        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: '12px' }}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar
              dataKey="Approved"
              stackId="a"
              fill="#40c057"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Changes Requested"
              stackId="a"
              fill="#fd7e14"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Commented"
              stackId="a"
              fill="#be4bdb"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Dismissed"
              stackId="a"
              fill="#868e96"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Pending"
              stackId="a"
              fill="#fcc419"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <Text size="sm" c="dimmed" ta="center">
          Showing all {reviewers.length} reviewer{reviewers.length !== 1 ? 's' : ''}
        </Text>
      </Stack>
    </Card>
  )
}

