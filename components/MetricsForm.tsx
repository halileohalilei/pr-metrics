'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  Divider,
  Text,
  Loader,
  Alert,
  Card,
  Grid,
  Title,
  NumberInput,
  Table,
} from '@mantine/core'
import { IconBrandGithub, IconCalendar, IconUsers, IconAlertCircle } from '@tabler/icons-react'
import {
  createGitHubClient,
  fetchAllPullRequests,
  fetchTeamMembers,
  calculateMetrics,
} from '@/lib/github'

// Helper function to format hours into human-readable string
function formatHours(hours: number): string {
  if (hours === 0) return '0 hours'
  if (hours < 1) return `${Math.round(hours * 60)} minutes`
  if (hours < 24) return `${hours.toFixed(1)} hours`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return `${days}d ${remainingHours}h`
}

interface FetchMetricsParams {
  org: string
  repo: string
  token: string
  since: Date
  until: Date
  team: string
}

const STORAGE_KEY = 'pr-metrics-form'

export default function MetricsForm() {
  const [org, setOrg] = useState('')
  const [repo, setRepo] = useState('')
  const [team, setTeam] = useState('')
  const [numDays, setNumDays] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  // Load form values from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.org) setOrg(data.org)
        if (data.repo) setRepo(data.repo)
        if (data.team) setTeam(data.team)
        if (data.numDays) setNumDays(data.numDays)
        if (data.startDate) setStartDate(data.startDate)
        if (data.endDate) setEndDate(data.endDate)
      } catch (e) {
        // Ignore invalid stored data
      }
    }
  }, [])

  // Save form values to localStorage whenever they change
  useEffect(() => {
    const data = {
      org,
      repo,
      team,
      numDays,
      startDate,
      endDate,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [org, repo, team, numDays, startDate, endDate])

  const mutation = useMutation({
    mutationFn: async (params: FetchMetricsParams) => {
      const { org, repo, token, since, until, team } = params

      // Create GitHub GraphQL client
      const client = createGitHubClient(token)

      // Fetch all pull requests
      const prs = await fetchAllPullRequests(client, org, repo, since, until)

      if (prs.length === 0) {
        throw new Error('No pull requests found in the specified date range.')
      }

      // Fetch team members if team filter is specified
      let teamMembers: string[] = []
      if (team) {
        teamMembers = await fetchTeamMembers(client, org, team)
      }

      // Calculate metrics
      const metrics = await calculateMetrics(prs, since, until, teamMembers)
      return metrics
    },
    onError: (err: Error) => {
      setError(err.message)
    },
    onSuccess: () => {
      setError('')
    },
  })

  const handleNumDaysChange = (value: string) => {
    setNumDays(value)
    if (value) {
      setStartDate('')
      setEndDate('')
    }
  }

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
    if (value) {
      setNumDays('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const token = (formData.get('token') as string).trim()

    // Validate date inputs
    let since: Date, until: Date
    if (numDays) {
      const now = new Date()
      since = new Date(now.getTime() - parseInt(numDays) * 24 * 60 * 60 * 1000)
      until = now
    } else if (startDate && endDate) {
      since = new Date(startDate)
      until = new Date(endDate)
      until.setHours(23, 59, 59, 999) // End of day
    } else {
      setError('Please specify either a date range or number of days.')
      return
    }

    mutation.mutate({ 
      org: org.trim(), 
      repo: repo.trim(), 
      token, 
      since, 
      until, 
      team: team.trim() 
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Organization Name"
            name="org"
            placeholder="e.g., facebook"
            required
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            leftSection={<IconBrandGithub size={16} />}
          />

          <TextInput
            label="Repository Name"
            name="repo"
            placeholder="e.g., react"
            required
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
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
                onChange={(e) => handleDateChange('start', e.target.value)}
                leftSection={<IconCalendar size={16} />}
              />
              <TextInput
                label="To"
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
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
              onChange={(value) => handleNumDaysChange(String(value))}
              leftSection={<IconCalendar size={16} />}
            />
          </div>

          <TextInput
            label="Team Name (optional)"
            name="team"
            placeholder="e.g., frontend-team"
            description="Filter reviewers by team name. Leave empty to show all reviewers."
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            leftSection={<IconUsers size={16} />}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={mutation.isPending}
            gradient={{ from: 'violet', to: 'grape', deg: 135 }}
            variant="gradient"
          >
            See Metrics
          </Button>
        </Stack>
      </form>

      {mutation.isPending && (
        <Group justify="center" mt="xl">
          <Stack align="center" gap="sm">
            <Loader size="lg" type="bars" />
            <Text c="dimmed">Fetching PR reviews via GraphQL...</Text>
          </Stack>
        </Group>
      )}

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mt="md">
          {error}
        </Alert>
      )}

      {mutation.isSuccess && mutation.data && (
        <Stack gap="xl" mt="xl">
          <Title order={2} ta="center">PR Review Metrics</Title>

          <Card
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.totalPRs}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Total PRs
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.openPRs}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Open
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.mergedPRs}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Merged
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.closedPRs}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Closed
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.totalReviews}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Total Reviews
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.totalComments}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Total Comments
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <Stack align="center" gap={4}>
                  <Text size="xl" fw={700} c="white">
                    {mutation.data.reviewers.length}
                  </Text>
                  <Text size="sm" c="white" opacity={0.9}>
                    Reviewers{mutation.data.teamFilter ? ' (Team)' : ''}
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>

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
                  {formatHours(mutation.data.timing.timeToFirstReview.average)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Time to First Review (median)
                </Text>
                <Text size="sm" fw={600}>
                  {formatHours(mutation.data.timing.timeToFirstReview.median)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Time to Merge (avg)
                </Text>
                <Text size="sm" fw={600}>
                  {formatHours(mutation.data.timing.timeToMerge.average)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Time to Merge (median)
                </Text>
                <Text size="sm" fw={600}>
                  {formatHours(mutation.data.timing.timeToMerge.median)}
                </Text>
              </Group>
            </Stack>
          </Card>

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
                  {mutation.data.distribution.reviewsPerPR.average.toFixed(1)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Reviews per PR (median)
                </Text>
                <Text size="sm" fw={600}>
                  {mutation.data.distribution.reviewsPerPR.median.toFixed(1)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Approvals before merge (avg)
                </Text>
                <Text size="sm" fw={600}>
                  {mutation.data.distribution.approvalsBeforeMerge.average.toFixed(1)}
                </Text>
              </Group>
            </Stack>
          </Card>

          <Title order={3} size="h4" mt="md">
            👥 Reviewers
          </Title>

          {mutation.data.reviewers.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              No reviewers found in the specified criteria.
            </Text>
          ) : (
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Total Reviews</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Unique PRs</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Approved</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Changes Requested</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Commented</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Dismissed</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Pending</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mutation.data.reviewers.map((reviewer) => {
                    const approvedPct = (
                      (reviewer.approved / reviewer.totalReviews) *
                      100
                    ).toFixed(1)
                    const changesRequestedPct = (
                      (reviewer.changesRequested / reviewer.totalReviews) *
                      100
                    ).toFixed(1)
                    const commentedPct = (
                      (reviewer.commented / reviewer.totalReviews) *
                      100
                    ).toFixed(1)
                    const dismissedPct = (
                      (reviewer.dismissed / reviewer.totalReviews) *
                      100
                    ).toFixed(1)
                    const pendingPct = (
                      (reviewer.pending / reviewer.totalReviews) *
                      100
                    ).toFixed(1)

                    const reviewerUrl = `https://github.com/${org}/${repo}/pulls?q=reviewed-by:${reviewer.name}`

                    return (
                      <Table.Tr key={reviewer.name}>
                        <Table.Td style={{ fontWeight: 600 }}>
                          <a 
                            href={reviewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              color: 'inherit',
                              textDecoration: 'none',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {reviewer.name}
                          </a>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>{reviewer.totalReviews}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>{reviewer.uniquePRs}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {reviewer.approved} ({approvedPct}%)
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {reviewer.changesRequested} ({changesRequestedPct}%)
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {reviewer.commented} ({commentedPct}%)
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {reviewer.dismissed > 0 ? `${reviewer.dismissed} (${dismissedPct}%)` : '-'}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {reviewer.pending > 0 ? `${reviewer.pending} (${pendingPct}%)` : '-'}
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </Card>
          )}
        </Stack>
      )}
    </>
  )
}
