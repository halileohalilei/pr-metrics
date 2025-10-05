'use client'

import { useState, FormEvent, useEffect } from 'react'
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
  const [numDays, setNumDays] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [token, setToken] = useState('')
  const [storeToken, setStoreToken] = useState(false)
  const [error, setError] = useState('')

  // Load form values from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: FormState = JSON.parse(stored)
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
      numDays,
      startDate,
      endDate,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [org, repo, team, numDays, startDate, endDate])

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

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    if (value) {
      setNumDays('')
    }
  }

  const handleEndDateChange = (value: string) => {
    setEndDate(value)
    if (value) {
      setNumDays('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token.trim()) {
      setError('Please provide a GitHub token.')
      return
    }

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
      token: token.trim(),
      since,
      until,
      team: team.trim(),
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
            numDays={numDays}
            startDate={startDate}
            endDate={endDate}
            token={token}
            storeToken={storeToken}
            isLoading={mutation.isPending}
            onOrgChange={setOrg}
            onRepoChange={setRepo}
            onTeamChange={setTeam}
            onNumDaysChange={handleNumDaysChange}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onTokenChange={setToken}
            onStoreTokenChange={handleStoreTokenChange}
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
        />
      </div>
    </div>
  )
}

