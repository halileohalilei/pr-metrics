'use client'

import { Card, Table, Text, Group, UnstyledButton, Badge, Button, Menu } from '@mantine/core'
import { IconChevronUp, IconChevronDown, IconSelector, IconDownload, IconFileTypeCsv, IconMarkdown } from '@tabler/icons-react'
import { reviewerLinkStyle, tableCellRightAlignStyle, tableCellBoldStyle } from '../../../../MetricsForm.styles'
import { ReviewersTableProps, SortColumn, SortDirection, SortMode } from './ReviewersTable.types'
import { useState, useMemo } from 'react'
import { notifications } from '@mantine/notifications'

export function ReviewersTable({ reviewers, org, repo }: ReviewersTableProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<SortColumn>('totalReviews')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [sortMode, setSortMode] = useState<SortMode>('count')

  const sortedReviewers = useMemo(() => {
    const sorted = [...reviewers].sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortColumn) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'totalReviews':
          aValue = a.totalReviews
          bValue = b.totalReviews
          break
        case 'uniquePRs':
          aValue = a.uniquePRs
          bValue = b.uniquePRs
          break
        case 'approved':
          if (sortMode === 'percentage') {
            aValue = a.totalReviews > 0 ? (a.approved / a.totalReviews) * 100 : 0
            bValue = b.totalReviews > 0 ? (b.approved / b.totalReviews) * 100 : 0
          } else {
            aValue = a.approved
            bValue = b.approved
          }
          break
        case 'changesRequested':
          if (sortMode === 'percentage') {
            aValue = a.totalReviews > 0 ? (a.changesRequested / a.totalReviews) * 100 : 0
            bValue = b.totalReviews > 0 ? (b.changesRequested / b.totalReviews) * 100 : 0
          } else {
            aValue = a.changesRequested
            bValue = b.changesRequested
          }
          break
        case 'commented':
          if (sortMode === 'percentage') {
            aValue = a.totalReviews > 0 ? (a.commented / a.totalReviews) * 100 : 0
            bValue = b.totalReviews > 0 ? (b.commented / b.totalReviews) * 100 : 0
          } else {
            aValue = a.commented
            bValue = b.commented
          }
          break
        case 'dismissed':
          if (sortMode === 'percentage') {
            aValue = a.totalReviews > 0 ? (a.dismissed / a.totalReviews) * 100 : 0
            bValue = b.totalReviews > 0 ? (b.dismissed / b.totalReviews) * 100 : 0
          } else {
            aValue = a.dismissed
            bValue = b.dismissed
          }
          break
        case 'pending':
          if (sortMode === 'percentage') {
            aValue = a.totalReviews > 0 ? (a.pending / a.totalReviews) * 100 : 0
            bValue = b.totalReviews > 0 ? (b.pending / b.totalReviews) * 100 : 0
          } else {
            aValue = a.pending
            bValue = b.pending
          }
          break
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return sorted
  }, [reviewers, sortColumn, sortDirection, sortMode])

  const percentageColumns: SortColumn[] = ['approved', 'changesRequested', 'commented', 'dismissed', 'pending']
  const supportsPercentage = (column: SortColumn) => percentageColumns.includes(column)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Same column clicked - cycle through sort modes
      if (supportsPercentage(column)) {
        // Cycle: count desc -> count asc -> percentage desc -> percentage asc -> count desc
        if (sortMode === 'count' && sortDirection === 'desc') {
          setSortDirection('asc')
        } else if (sortMode === 'count' && sortDirection === 'asc') {
          setSortMode('percentage')
          setSortDirection('desc')
        } else if (sortMode === 'percentage' && sortDirection === 'desc') {
          setSortDirection('asc')
        } else {
          // Back to count desc
          setSortMode('count')
          setSortDirection('desc')
        }
      } else {
        // Just toggle direction for non-percentage columns
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      }
    } else {
      // New column clicked
      setSortColumn(column)
      setSortDirection('desc')
      setSortMode('count')
    }
  }

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <IconSelector size={14} />
    }
    return sortDirection === 'asc' 
      ? <IconChevronUp size={14} />
      : <IconChevronDown size={14} />
  }

  const exportAsCSV = () => {
    const headers = ['Name', 'Total Reviews', 'Unique PRs', 'Approved', 'Changes Requested', 'Commented', 'Dismissed', 'Pending']
    const csvRows = [headers.join(',')]

    sortedReviewers.forEach((reviewer) => {
      const approvedPct = ((reviewer.approved / reviewer.totalReviews) * 100).toFixed(1)
      const changesRequestedPct = ((reviewer.changesRequested / reviewer.totalReviews) * 100).toFixed(1)
      const commentedPct = ((reviewer.commented / reviewer.totalReviews) * 100).toFixed(1)
      const dismissedPct = ((reviewer.dismissed / reviewer.totalReviews) * 100).toFixed(1)
      const pendingPct = ((reviewer.pending / reviewer.totalReviews) * 100).toFixed(1)

      const row = [
        `"${reviewer.name}"`,
        reviewer.totalReviews,
        reviewer.uniquePRs,
        `"${reviewer.approved} (${approvedPct}%)"`,
        `"${reviewer.changesRequested} (${changesRequestedPct}%)"`,
        `"${reviewer.commented} (${commentedPct}%)"`,
        reviewer.dismissed > 0 ? `"${reviewer.dismissed} (${dismissedPct}%)"` : '"-"',
        reviewer.pending > 0 ? `"${reviewer.pending} (${pendingPct}%)"` : '"-"'
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pr-metrics-${org}-${repo}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    notifications.show({
      title: 'Success',
      message: 'CSV file downloaded successfully',
      color: 'green',
    })
  }

  const copyAsMarkdown = () => {
    const headers = ['Name', 'Total Reviews', 'Unique PRs', 'Approved', 'Changes Requested', 'Commented', 'Dismissed', 'Pending']
    const separator = headers.map(() => '---').join(' | ')
    const headerRow = headers.join(' | ')
    
    const rows = sortedReviewers.map((reviewer) => {
      const approvedPct = ((reviewer.approved / reviewer.totalReviews) * 100).toFixed(1)
      const changesRequestedPct = ((reviewer.changesRequested / reviewer.totalReviews) * 100).toFixed(1)
      const commentedPct = ((reviewer.commented / reviewer.totalReviews) * 100).toFixed(1)
      const dismissedPct = ((reviewer.dismissed / reviewer.totalReviews) * 100).toFixed(1)
      const pendingPct = ((reviewer.pending / reviewer.totalReviews) * 100).toFixed(1)

      return [
        reviewer.name,
        reviewer.totalReviews,
        reviewer.uniquePRs,
        `${reviewer.approved} (${approvedPct}%)`,
        `${reviewer.changesRequested} (${changesRequestedPct}%)`,
        `${reviewer.commented} (${commentedPct}%)`,
        reviewer.dismissed > 0 ? `${reviewer.dismissed} (${dismissedPct}%)` : '-',
        reviewer.pending > 0 ? `${reviewer.pending} (${pendingPct}%)` : '-'
      ].join(' | ')
    })

    const markdown = [headerRow, separator, ...rows].join('\n')
    
    navigator.clipboard.writeText(markdown).then(() => {
      notifications.show({
        title: 'Success',
        message: 'Markdown table copied to clipboard',
        color: 'green',
      })
    }).catch(() => {
      notifications.show({
        title: 'Error',
        message: 'Failed to copy to clipboard',
        color: 'red',
      })
    })
  }

  const SortableHeader = ({ column, label, align = 'left' }: { 
    column: SortColumn
    label: string
    align?: 'left' | 'right'
  }) => {
    const isActive = sortColumn === column
    const showModeIndicator = isActive && supportsPercentage(column)

    return (
      <Table.Th style={align === 'right' ? tableCellRightAlignStyle : undefined}>
        <UnstyledButton onClick={() => handleSort(column)} style={{ width: '100%' }}>
          <Group gap={4} justify={align === 'right' ? 'flex-end' : 'flex-start'} wrap="nowrap">
            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
              {label}
            </Text>
            {showModeIndicator && (
              <Badge size="xs" variant="light" color={sortMode === 'percentage' ? 'blue' : 'gray'}>
                {sortMode === 'percentage' ? '%' : '#'}
              </Badge>
            )}
            {getSortIcon(column)}
          </Group>
        </UnstyledButton>
      </Table.Th>
    )
  }

  if (reviewers.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No reviewers found in the specified criteria.
      </Text>
    )
  }

  return (
    <>
      <Group justify="flex-end" mb="sm">
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="light"
              size="sm"
            >
              Export
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Export Options</Menu.Label>
            <Menu.Item
              leftSection={<IconFileTypeCsv size={16} />}
              onClick={exportAsCSV}
            >
              Export as CSV
            </Menu.Item>
            <Menu.Item
              leftSection={<IconMarkdown size={16} />}
              onClick={copyAsMarkdown}
            >
              Copy as Markdown
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Card shadow="sm" p="lg" radius="md" withBorder style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover style={{ minWidth: '800px' }}>
        <Table.Thead>
          <Table.Tr>
            <SortableHeader column="name" label="Name" />
            <SortableHeader column="totalReviews" label="Total Reviews" align="right" />
            <SortableHeader column="uniquePRs" label="Unique PRs" align="right" />
            <SortableHeader column="approved" label="Approved" align="right" />
            <SortableHeader column="changesRequested" label="Changes Requested" align="right" />
            <SortableHeader column="commented" label="Commented" align="right" />
            <SortableHeader column="dismissed" label="Dismissed" align="right" />
            <SortableHeader column="pending" label="Pending" align="right" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedReviewers.map((reviewer) => {
            const approvedPct = ((reviewer.approved / reviewer.totalReviews) * 100).toFixed(1)
            const changesRequestedPct = ((reviewer.changesRequested / reviewer.totalReviews) * 100).toFixed(1)
            const commentedPct = ((reviewer.commented / reviewer.totalReviews) * 100).toFixed(1)
            const dismissedPct = ((reviewer.dismissed / reviewer.totalReviews) * 100).toFixed(1)
            const pendingPct = ((reviewer.pending / reviewer.totalReviews) * 100).toFixed(1)

            const reviewerUrl = `https://github.com/${org}/${repo}/pulls?q=reviewed-by:${reviewer.login}`
            const isHovered = hoveredLink === reviewer.login

            return (
              <Table.Tr key={reviewer.login}>
                <Table.Td style={tableCellBoldStyle}>
                  <a
                    href={reviewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...reviewerLinkStyle,
                      textDecoration: isHovered ? 'underline' : 'none',
                    }}
                    onMouseEnter={() => setHoveredLink(reviewer.login)}
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
    </>
  )
}

