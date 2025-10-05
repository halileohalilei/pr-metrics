'use client'

import { Card, Table, Text } from '@mantine/core'
import { reviewerLinkStyle, tableCellRightAlignStyle, tableCellBoldStyle } from '../../../../MetricsForm.styles'
import { ReviewersTableProps } from './ReviewersTable.types'
import { useState } from 'react'

export function ReviewersTable({ reviewers, org, repo }: ReviewersTableProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  if (reviewers.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No reviewers found in the specified criteria.
      </Text>
    )
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Total Reviews</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Unique PRs</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Approved</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Changes Requested</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Commented</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Dismissed</Table.Th>
            <Table.Th style={tableCellRightAlignStyle}>Pending</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reviewers.map((reviewer) => {
            const approvedPct = ((reviewer.approved / reviewer.totalReviews) * 100).toFixed(1)
            const changesRequestedPct = ((reviewer.changesRequested / reviewer.totalReviews) * 100).toFixed(1)
            const commentedPct = ((reviewer.commented / reviewer.totalReviews) * 100).toFixed(1)
            const dismissedPct = ((reviewer.dismissed / reviewer.totalReviews) * 100).toFixed(1)
            const pendingPct = ((reviewer.pending / reviewer.totalReviews) * 100).toFixed(1)

            const reviewerUrl = `https://github.com/${org}/${repo}/pulls?q=reviewed-by:${reviewer.name}`
            const isHovered = hoveredLink === reviewer.name

            return (
              <Table.Tr key={reviewer.name}>
                <Table.Td style={tableCellBoldStyle}>
                  <a
                    href={reviewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...reviewerLinkStyle,
                      textDecoration: isHovered ? 'underline' : 'none',
                    }}
                    onMouseEnter={() => setHoveredLink(reviewer.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {reviewer.name}
                  </a>
                </Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>{reviewer.totalReviews}</Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>{reviewer.uniquePRs}</Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>
                  {reviewer.approved} ({approvedPct}%)
                </Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>
                  {reviewer.changesRequested} ({changesRequestedPct}%)
                </Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>
                  {reviewer.commented} ({commentedPct}%)
                </Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>
                  {reviewer.dismissed > 0 ? `${reviewer.dismissed} (${dismissedPct}%)` : '-'}
                </Table.Td>
                <Table.Td style={tableCellRightAlignStyle}>
                  {reviewer.pending > 0 ? `${reviewer.pending} (${pendingPct}%)` : '-'}
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Card>
  )
}

