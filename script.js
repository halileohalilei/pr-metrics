document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('metricsForm');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const results = document.getElementById('results');
    const metricsContainer = document.getElementById('metricsContainer');
    const submitBtn = document.getElementById('submitBtn');
    
    // Date input synchronization
    const numDaysInput = document.getElementById('numDays');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    numDaysInput.addEventListener('input', function() {
        if (this.value) {
            startDateInput.value = '';
            endDateInput.value = '';
        }
    });
    
    [startDateInput, endDateInput].forEach(input => {
        input.addEventListener('input', function() {
            if (startDateInput.value || endDateInput.value) {
                numDaysInput.value = '';
            }
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const org = document.getElementById('org').value.trim();
        const repo = document.getElementById('repo').value.trim();
        const token = document.getElementById('token').value.trim();
        const team = document.getElementById('team').value.trim();
        const numDays = document.getElementById('numDays').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        // Validate date inputs
        let since, until;
        if (numDays) {
            const now = new Date();
            since = new Date(now.getTime() - (numDays * 24 * 60 * 60 * 1000));
            until = now;
        } else if (startDate && endDate) {
            since = new Date(startDate);
            until = new Date(endDate);
            until.setHours(23, 59, 59, 999); // End of day
        } else {
            showError('Please specify either a date range or number of days.');
            return;
        }
        
        // Show loading state
        loading.style.display = 'block';
        error.style.display = 'none';
        results.style.display = 'none';
        submitBtn.disabled = true;
        
        try {
            const metrics = await fetchPRMetrics(org, repo, token, since, until, team);
            displayMetrics(metrics, since, until);
        } catch (err) {
            showError(err.message);
        } finally {
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    function showError(message) {
        error.textContent = message;
        error.style.display = 'block';
        results.style.display = 'none';
    }
    
    async function fetchPRMetrics(org, repo, token, since, until, teamFilter) {
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        
        // Fetch all pull requests in the date range
        const prs = await fetchAllPullRequests(org, repo, headers, since, until);
        
        if (prs.length === 0) {
            throw new Error('No pull requests found in the specified date range.');
        }
        
        // Fetch reviews for all PRs
        const reviewerMetrics = {};
        let totalReviews = 0;
        
        for (const pr of prs) {
            const reviews = await fetchReviews(org, repo, pr.number, headers);
            
            for (const review of reviews) {
                const reviewer = review.user.login;
                const reviewDate = new Date(review.submitted_at);
                
                // Filter by date range
                if (reviewDate < since || reviewDate > until) {
                    continue;
                }
                
                if (!reviewerMetrics[reviewer]) {
                    reviewerMetrics[reviewer] = {
                        name: reviewer,
                        totalReviews: 0,
                        approved: 0,
                        changesRequested: 0,
                        commented: 0,
                        prsReviewed: new Set()
                    };
                }
                
                reviewerMetrics[reviewer].totalReviews++;
                reviewerMetrics[reviewer].prsReviewed.add(pr.number);
                totalReviews++;
                
                if (review.state === 'APPROVED') {
                    reviewerMetrics[reviewer].approved++;
                } else if (review.state === 'CHANGES_REQUESTED') {
                    reviewerMetrics[reviewer].changesRequested++;
                } else if (review.state === 'COMMENTED') {
                    reviewerMetrics[reviewer].commented++;
                }
            }
        }
        
        // Filter by team if specified
        let filteredMetrics = Object.values(reviewerMetrics);
        if (teamFilter) {
            // Fetch team members
            const teamMembers = await fetchTeamMembers(org, teamFilter, headers);
            filteredMetrics = filteredMetrics.filter(metric => 
                teamMembers.includes(metric.name)
            );
        }
        
        // Convert Set to count
        filteredMetrics.forEach(metric => {
            metric.uniquePRs = metric.prsReviewed.size;
            delete metric.prsReviewed;
        });
        
        // Sort by total reviews
        filteredMetrics.sort((a, b) => b.totalReviews - a.totalReviews);
        
        return {
            reviewers: filteredMetrics,
            totalPRs: prs.length,
            totalReviews: totalReviews,
            teamFilter: teamFilter
        };
    }
    
    async function fetchAllPullRequests(org, repo, headers, since, until) {
        const allPRs = [];
        let page = 1;
        const perPage = 100;
        
        while (true) {
            const url = `https://api.github.com/repos/${org}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=${perPage}&page=${page}`;
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid GitHub token. Please check your token.');
                } else if (response.status === 404) {
                    throw new Error('Repository not found. Please check organization and repository names.');
                }
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const prs = await response.json();
            
            if (prs.length === 0) break;
            
            // Filter PRs by date range
            const filteredPRs = prs.filter(pr => {
                const updatedAt = new Date(pr.updated_at);
                return updatedAt >= since && updatedAt <= until;
            });
            
            allPRs.push(...filteredPRs);
            
            // If we got fewer PRs than requested or the last PR is before our date range, stop
            if (prs.length < perPage || new Date(prs[prs.length - 1].updated_at) < since) {
                break;
            }
            
            page++;
        }
        
        return allPRs;
    }
    
    async function fetchReviews(org, repo, prNumber, headers) {
        const url = `https://api.github.com/repos/${org}/${repo}/pulls/${prNumber}/reviews`;
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`Failed to fetch reviews for PR #${prNumber}`);
            return [];
        }
        
        return await response.json();
    }
    
    async function fetchTeamMembers(org, teamSlug, headers) {
        try {
            const url = `https://api.github.com/orgs/${org}/teams/${teamSlug}/members`;
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                console.warn(`Failed to fetch team members: ${response.status}. Showing all reviewers.`);
                return [];
            }
            
            const members = await response.json();
            return members.map(member => member.login);
        } catch (err) {
            console.warn('Failed to fetch team members. Showing all reviewers.');
            return [];
        }
    }
    
    function displayMetrics(metrics, since, until) {
        metricsContainer.innerHTML = '';
        
        // Display summary stats
        const summaryHTML = `
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-value">${metrics.totalPRs}</div>
                    <div class="stat-label">Total PRs</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${metrics.totalReviews}</div>
                    <div class="stat-label">Total Reviews</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${metrics.reviewers.length}</div>
                    <div class="stat-label">Reviewers${metrics.teamFilter ? ' (Team)' : ''}</div>
                </div>
            </div>
        `;
        metricsContainer.innerHTML = summaryHTML;
        
        if (metrics.reviewers.length === 0) {
            metricsContainer.innerHTML += '<div class="no-results">No reviewers found in the specified criteria.</div>';
            results.style.display = 'block';
            return;
        }
        
        // Display individual reviewer metrics
        metrics.reviewers.forEach(reviewer => {
            const approvedPct = ((reviewer.approved / reviewer.totalReviews) * 100).toFixed(1);
            const changesRequestedPct = ((reviewer.changesRequested / reviewer.totalReviews) * 100).toFixed(1);
            const commentedPct = ((reviewer.commented / reviewer.totalReviews) * 100).toFixed(1);
            
            const cardHTML = `
                <div class="metric-card">
                    <h3>${reviewer.name}</h3>
                    <div class="metric-row">
                        <span class="metric-label">Total Reviews</span>
                        <span class="metric-value">${reviewer.totalReviews}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Unique PRs Reviewed</span>
                        <span class="metric-value">${reviewer.uniquePRs}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Approved</span>
                        <span class="metric-value">${reviewer.approved} (${approvedPct}%)</span>
                    </div>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${approvedPct}%">
                            ${approvedPct > 10 ? approvedPct + '%' : ''}
                        </div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Changes Requested</span>
                        <span class="metric-value">${reviewer.changesRequested} (${changesRequestedPct}%)</span>
                    </div>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${changesRequestedPct}%">
                            ${changesRequestedPct > 10 ? changesRequestedPct + '%' : ''}
                        </div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Commented</span>
                        <span class="metric-value">${reviewer.commented} (${commentedPct}%)</span>
                    </div>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${commentedPct}%">
                            ${commentedPct > 10 ? commentedPct + '%' : ''}
                        </div>
                    </div>
                </div>
            `;
            
            metricsContainer.innerHTML += cardHTML;
        });
        
        results.style.display = 'block';
    }
});
