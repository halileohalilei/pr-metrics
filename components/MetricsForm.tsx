'use client'

import { useState, FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  createGitHubClient,
  fetchAllPullRequests,
  fetchTeamMembers,
  calculateMetrics,
  type PRMetrics,
} from '@/lib/github-api'

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

export default function MetricsForm() {
  const [numDays, setNumDays] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

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
    const org = (formData.get('org') as string).trim()
    const repo = (formData.get('repo') as string).trim()
    const token = (formData.get('token') as string).trim()
    const team = (formData.get('team') as string).trim()

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

    mutation.mutate({ org, repo, token, since, until, team })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="org">Organization Name *</label>
          <input type="text" id="org" name="org" required placeholder="e.g., facebook" />
        </div>

        <div className="form-group">
          <label htmlFor="repo">Repository Name *</label>
          <input type="text" id="repo" name="repo" required placeholder="e.g., react" />
        </div>

        <div className="form-group">
          <label htmlFor="token">GitHub Token *</label>
          <input
            type="password"
            id="token"
            name="token"
            required
            placeholder="Your GitHub personal access token"
          />
          <small>Token needs &apos;repo&apos; and &apos;read:org&apos; scopes</small>
        </div>

        <div className="form-group">
          <label>Date Range</label>
          <div className="date-range">
            <div className="date-input-group">
              <label htmlFor="startDate">From</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={(e) => handleDateChange('start', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="endDate">To</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
              />
            </div>
          </div>
          <div className="or-divider">OR</div>
          <div className="days-input-group">
            <label htmlFor="numDays">Number of Days (from today)</label>
            <input
              type="number"
              id="numDays"
              name="numDays"
              min="1"
              placeholder="e.g., 30"
              value={numDays}
              onChange={(e) => handleNumDaysChange(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="team">Team Name (optional)</label>
          <input type="text" id="team" name="team" placeholder="e.g., frontend-team" />
          <small>Filter reviewers by team name. Leave empty to show all reviewers.</small>
        </div>

        <button type="submit" className="submit-btn" disabled={mutation.isPending}>
          {mutation.isPending ? 'Fetching...' : 'See Metrics'}
        </button>
      </form>

      {mutation.isPending && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching PR reviews via GraphQL...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {mutation.isSuccess && mutation.data && (
        <div className="results">
          <h2>PR Review Metrics</h2>
          <div>
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{mutation.data.totalPRs}</div>
                <div className="stat-label">Total PRs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{mutation.data.openPRs}</div>
                <div className="stat-label">Open</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{mutation.data.mergedPRs}</div>
                <div className="stat-label">Merged</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{mutation.data.closedPRs}</div>
                <div className="stat-label">Closed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{mutation.data.totalReviews}</div>
                <div className="stat-label">Total Reviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{mutation.data.totalComments}</div>
                <div className="stat-label">Total Comments</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{mutation.data.reviewers.length}</div>
                <div className="stat-label">
                  Reviewers{mutation.data.teamFilter ? ' (Team)' : ''}
                </div>
              </div>
            </div>

            <div className="timing-stats">
              <h3>⏱️ Review Timing</h3>
              <div className="metric-row">
                <span className="metric-label">Time to First Review (avg)</span>
                <span className="metric-value">
                  {formatHours(mutation.data.timing.timeToFirstReview.average)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Time to First Review (median)</span>
                <span className="metric-value">
                  {formatHours(mutation.data.timing.timeToFirstReview.median)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Time to Merge (avg)</span>
                <span className="metric-value">
                  {formatHours(mutation.data.timing.timeToMerge.average)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Time to Merge (median)</span>
                <span className="metric-value">
                  {formatHours(mutation.data.timing.timeToMerge.median)}
                </span>
              </div>
            </div>

            <div className="distribution-stats">
              <h3>📈 Review Distribution</h3>
              <div className="metric-row">
                <span className="metric-label">Reviews per PR (avg)</span>
                <span className="metric-value">
                  {mutation.data.distribution.reviewsPerPR.average.toFixed(1)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Reviews per PR (median)</span>
                <span className="metric-value">
                  {mutation.data.distribution.reviewsPerPR.median.toFixed(1)}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Approvals before merge (avg)</span>
                <span className="metric-value">
                  {mutation.data.distribution.approvalsBeforeMerge.average.toFixed(1)}
                </span>
              </div>
            </div>

            <h3>👥 Reviewers</h3>

            {mutation.data.reviewers.length === 0 ? (
              <div className="no-results">No reviewers found in the specified criteria.</div>
            ) : (
              mutation.data.reviewers.map((reviewer) => {
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

                return (
                  <div key={reviewer.name} className="metric-card">
                    <h3>{reviewer.name}</h3>
                    <div className="metric-row">
                      <span className="metric-label">Total Reviews</span>
                      <span className="metric-value">{reviewer.totalReviews}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Unique PRs Reviewed</span>
                      <span className="metric-value">{reviewer.uniquePRs}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Approved</span>
                      <span className="metric-value">
                        {reviewer.approved} ({approvedPct}%)
                      </span>
                    </div>
                    <div className="percentage-bar">
                      <div className="percentage-fill" style={{ width: `${approvedPct}%` }}>
                        {parseFloat(approvedPct) > 10 ? `${approvedPct}%` : ''}
                      </div>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Changes Requested</span>
                      <span className="metric-value">
                        {reviewer.changesRequested} ({changesRequestedPct}%)
                      </span>
                    </div>
                    <div className="percentage-bar">
                      <div
                        className="percentage-fill"
                        style={{ width: `${changesRequestedPct}%` }}
                      >
                        {parseFloat(changesRequestedPct) > 10 ? `${changesRequestedPct}%` : ''}
                      </div>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Commented</span>
                      <span className="metric-value">
                        {reviewer.commented} ({commentedPct}%)
                      </span>
                    </div>
                    <div className="percentage-bar">
                      <div className="percentage-fill" style={{ width: `${commentedPct}%` }}>
                        {parseFloat(commentedPct) > 10 ? `${commentedPct}%` : ''}
                      </div>
                    </div>
                    {(reviewer.dismissed > 0 || reviewer.pending > 0) && (
                      <>
                        {reviewer.dismissed > 0 && (
                          <>
                            <div className="metric-row">
                              <span className="metric-label">Dismissed</span>
                              <span className="metric-value">
                                {reviewer.dismissed} ({dismissedPct}%)
                              </span>
                            </div>
                            <div className="percentage-bar">
                              <div className="percentage-fill" style={{ width: `${dismissedPct}%` }}>
                                {parseFloat(dismissedPct) > 10 ? `${dismissedPct}%` : ''}
                              </div>
                            </div>
                          </>
                        )}
                        {reviewer.pending > 0 && (
                          <>
                            <div className="metric-row">
                              <span className="metric-label">Pending</span>
                              <span className="metric-value">
                                {reviewer.pending} ({pendingPct}%)
                              </span>
                            </div>
                            <div className="percentage-bar">
                              <div className="percentage-fill" style={{ width: `${pendingPct}%` }}>
                                {parseFloat(pendingPct) > 10 ? `${pendingPct}%` : ''}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </>
  )
}
