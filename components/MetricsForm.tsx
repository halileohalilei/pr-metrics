'use client'

import { useState, FormEvent } from 'react'

interface ReviewerMetric {
  name: string
  totalReviews: number
  approved: number
  changesRequested: number
  commented: number
  uniquePRs: number
}

interface Metrics {
  reviewers: ReviewerMetric[]
  totalPRs: number
  totalReviews: number
  teamFilter: string
}

export default function MetricsForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [numDays, setNumDays] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
      since = new Date(now.getTime() - (parseInt(numDays) * 24 * 60 * 60 * 1000))
      until = now
    } else if (startDate && endDate) {
      since = new Date(startDate)
      until = new Date(endDate)
      until.setHours(23, 59, 59, 999) // End of day
    } else {
      setError('Please specify either a date range or number of days.')
      return
    }

    setLoading(true)
    setError('')
    setMetrics(null)

    try {
      const fetchedMetrics = await fetchPRMetrics(org, repo, token, since, until, team)
      setMetrics(fetchedMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
          <input type="password" id="token" name="token" required placeholder="Your GitHub personal access token" />
          <small>Token needs &apos;repo&apos; scope to access private repositories</small>
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

        <button type="submit" className="submit-btn" disabled={loading}>
          See Metrics
        </button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching PR reviews...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {metrics && (
        <div className="results">
          <h2>PR Review Metrics</h2>
          <div>
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{metrics.totalPRs}</div>
                <div className="stat-label">Total PRs</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{metrics.totalReviews}</div>
                <div className="stat-label">Total Reviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{metrics.reviewers.length}</div>
                <div className="stat-label">Reviewers{metrics.teamFilter ? ' (Team)' : ''}</div>
              </div>
            </div>

            {metrics.reviewers.length === 0 ? (
              <div className="no-results">No reviewers found in the specified criteria.</div>
            ) : (
              metrics.reviewers.map((reviewer) => {
                const approvedPct = ((reviewer.approved / reviewer.totalReviews) * 100).toFixed(1)
                const changesRequestedPct = ((reviewer.changesRequested / reviewer.totalReviews) * 100).toFixed(1)
                const commentedPct = ((reviewer.commented / reviewer.totalReviews) * 100).toFixed(1)

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
                      <span className="metric-value">{reviewer.approved} ({approvedPct}%)</span>
                    </div>
                    <div className="percentage-bar">
                      <div className="percentage-fill" style={{ width: `${approvedPct}%` }}>
                        {parseFloat(approvedPct) > 10 ? `${approvedPct}%` : ''}
                      </div>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Changes Requested</span>
                      <span className="metric-value">{reviewer.changesRequested} ({changesRequestedPct}%)</span>
                    </div>
                    <div className="percentage-bar">
                      <div className="percentage-fill" style={{ width: `${changesRequestedPct}%` }}>
                        {parseFloat(changesRequestedPct) > 10 ? `${changesRequestedPct}%` : ''}
                      </div>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Commented</span>
                      <span className="metric-value">{reviewer.commented} ({commentedPct}%)</span>
                    </div>
                    <div className="percentage-bar">
                      <div className="percentage-fill" style={{ width: `${commentedPct}%` }}>
                        {parseFloat(commentedPct) > 10 ? `${commentedPct}%` : ''}
                      </div>
                    </div>
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

async function fetchPRMetrics(
  org: string,
  repo: string,
  token: string,
  since: Date,
  until: Date,
  teamFilter: string
): Promise<Metrics> {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }

  // Fetch all pull requests in the date range
  const prs = await fetchAllPullRequests(org, repo, headers, since, until)

  if (prs.length === 0) {
    throw new Error('No pull requests found in the specified date range.')
  }

  // Fetch reviews for all PRs
  const reviewerMetrics: { [key: string]: any } = {}
  let totalReviews = 0

  for (const pr of prs) {
    const reviews = await fetchReviews(org, repo, pr.number, headers)

    for (const review of reviews) {
      const reviewer = review.user.login
      const reviewDate = new Date(review.submitted_at)

      // Filter by date range
      if (reviewDate < since || reviewDate > until) {
        continue
      }

      if (!reviewerMetrics[reviewer]) {
        reviewerMetrics[reviewer] = {
          name: reviewer,
          totalReviews: 0,
          approved: 0,
          changesRequested: 0,
          commented: 0,
          prsReviewed: new Set()
        }
      }

      reviewerMetrics[reviewer].totalReviews++
      reviewerMetrics[reviewer].prsReviewed.add(pr.number)
      totalReviews++

      if (review.state === 'APPROVED') {
        reviewerMetrics[reviewer].approved++
      } else if (review.state === 'CHANGES_REQUESTED') {
        reviewerMetrics[reviewer].changesRequested++
      } else if (review.state === 'COMMENTED') {
        reviewerMetrics[reviewer].commented++
      }
    }
  }

  // Filter by team if specified
  let filteredMetrics = Object.values(reviewerMetrics)
  if (teamFilter) {
    // Fetch team members
    const teamMembers = await fetchTeamMembers(org, teamFilter, headers)
    filteredMetrics = filteredMetrics.filter((metric: any) =>
      teamMembers.includes(metric.name)
    )
  }

  // Convert Set to count
  filteredMetrics.forEach((metric: any) => {
    metric.uniquePRs = metric.prsReviewed.size
    delete metric.prsReviewed
  })

  // Sort by total reviews
  filteredMetrics.sort((a: any, b: any) => b.totalReviews - a.totalReviews)

  return {
    reviewers: filteredMetrics as ReviewerMetric[],
    totalPRs: prs.length,
    totalReviews: totalReviews,
    teamFilter: teamFilter
  }
}

async function fetchAllPullRequests(
  org: string,
  repo: string,
  headers: any,
  since: Date,
  until: Date
): Promise<any[]> {
  const allPRs: any[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = `https://api.github.com/repos/${org}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=${perPage}&page=${page}`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid GitHub token. Please check your token.')
      } else if (response.status === 404) {
        throw new Error('Repository not found. Please check organization and repository names.')
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const prs = await response.json()

    if (prs.length === 0) break

    // Filter PRs by date range
    const filteredPRs = prs.filter((pr: any) => {
      const updatedAt = new Date(pr.updated_at)
      return updatedAt >= since && updatedAt <= until
    })

    allPRs.push(...filteredPRs)

    // If we got fewer PRs than requested or the last PR is before our date range, stop
    if (prs.length < perPage || new Date(prs[prs.length - 1].updated_at) < since) {
      break
    }

    page++
  }

  return allPRs
}

async function fetchReviews(org: string, repo: string, prNumber: number, headers: any): Promise<any[]> {
  const url = `https://api.github.com/repos/${org}/${repo}/pulls/${prNumber}/reviews`
  const response = await fetch(url, { headers })

  if (!response.ok) {
    console.error(`Failed to fetch reviews for PR #${prNumber}`)
    return []
  }

  return await response.json()
}

async function fetchTeamMembers(org: string, teamSlug: string, headers: any): Promise<string[]> {
  try {
    const url = `https://api.github.com/orgs/${org}/teams/${teamSlug}/members`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.warn(`Failed to fetch team members: ${response.status}. Showing all reviewers.`)
      return []
    }

    const members = await response.json()
    return members.map((member: any) => member.login)
  } catch (err) {
    console.warn('Failed to fetch team members. Showing all reviewers.')
    return []
  }
}

