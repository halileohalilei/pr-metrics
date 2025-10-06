'use client'

import { useState, FormEvent, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createGitHubClient, fetchAllPullRequests, fetchTeamMembers, calculateMetrics } from '@/lib/github'
import { FormInputs } from './components/FormInputs'
import { MetricsResults } from './components/MetricsResults'
import { FetchMetricsParams, FormState } from './MetricsForm.types'
import styles from './MetricsForm.module.css'

const STORAGE_KEY = 'pr-metrics-form'
const TOKEN_STORAGE_KEY = 'pr-metrics-token'

export function MetricsForm() {
  const [org, setOrg] = useState('')
  const [repo, setRepo] = useState('')
  const [team, setTeam] = useState('')
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [token, setToken] = useState('')
  const [storeToken, setStoreToken] = useState(false)
  const [error, setError] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load form values from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: FormState = JSON.parse(stored)
        if (data.org) setOrg(data.org)
        if (data.repo) setRepo(data.repo)
        if (data.team) setTeam(data.team)
        if (data.startDate && data.endDate) {
          setDateRange([new Date(data.startDate), new Date(data.endDate)])
        }
      } catch (e) {
        // Ignore invalid stored data
      }
    }

    // Load token if stored
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (storedToken) {
      setToken(storedToken)
      setStoreToken(true)
    }
  }, [])

  // Save form values to localStorage whenever they change
  useEffect(() => {
    const data: FormState = {
      org,
      repo,
      team,
      startDate: dateRange[0] ? dateRange[0].toISOString() : '',
      endDate: dateRange[1] ? dateRange[1].toISOString() : '',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [org, repo, team, dateRange])

  // Handle token storage
  useEffect(() => {
    if (storeToken && token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else if (!storeToken) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [storeToken, token])

  const handleStoreTokenChange = (checked: boolean) => {
    setStoreToken(checked)
    if (!checked) {
      setToken('')
    }
  }

  const mutation = useMutation({
    mutationFn: async (params: FetchMetricsParams) => {
      const { org, repo, token, since, until, team, signal } = params

      // Create GitHub GraphQL client
      const client = createGitHubClient(token, signal)

      // Fetch all pull requests
      const prs = await fetchAllPullRequests(client, org, repo, since, until, signal)

      if (prs.length === 0) {
        throw new Error('No pull requests found in the specified date range.')
      }

      // Fetch team members if team filter is specified
      let teamMembers: string[] = []
      if (team) {
        teamMembers = await fetchTeamMembers(client, org, team, signal)
      }

      // Calculate metrics
      const metrics = await calculateMetrics(prs, since, until, teamMembers)
      return metrics
    },
    onError: (err: Error) => {
      if (err.message !== 'Request cancelled') {
        setError(err.message)
      }
      abortControllerRef.current = null
    },
    onSuccess: () => {
      setError('')
      abortControllerRef.current = null
    },
  })

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setError('Request cancelled')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token.trim()) {
      setError('Please provide a GitHub token.')
      return
    }

    // Validate date inputs
    const [startDate, endDate] = dateRange
    if (!startDate || !endDate) {
      setError('Please select a date range.')
      return
    }

    const since = new Date(startDate)
    const until = new Date(endDate)
    until.setHours(23, 59, 59, 999) // End of day

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    mutation.mutate({
      org: org.trim(),
      repo: repo.trim(),
      token: token.trim(),
      since,
      until,
      team: team.trim(),
      signal: abortControllerRef.current.signal,
    })
  }

  return (
    <div className={styles.metricsLayout}>
      <div className={styles.formColumn}>
        <form onSubmit={handleSubmit}>
          <FormInputs
            org={org}
            repo={repo}
            team={team}
            dateRange={dateRange}
            token={token}
            storeToken={storeToken}
            isLoading={mutation.isPending}
            onOrgChange={setOrg}
            onRepoChange={setRepo}
            onTeamChange={setTeam}
            onDateRangeChange={setDateRange}
            onTokenChange={setToken}
            onStoreTokenChange={handleStoreTokenChange}
            onCancel={handleCancel}
          />
        </form>
      </div>

      <div className={styles.resultsColumn}>
        <MetricsResults
          isPending={mutation.isPending}
          isSuccess={mutation.isSuccess}
          error={error}
          data={mutation.data}
          org={org}
          repo={repo}
          dateRange={dateRange}
        />
      </div>
    </div>
  )
}

