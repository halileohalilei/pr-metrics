# PR Metrics

A static web page to analyze GitHub Pull Request review metrics for teams and individuals.

## Features

- Fetch PR review data from any GitHub repository
- Filter by date range or number of days
- Optional team-based filtering
- Display detailed metrics for each reviewer:
  - Total reviews
  - Unique PRs reviewed
  - Approval rate with percentages
  - Changes requested rate with percentages
  - Comment rate with percentages
- Beautiful, responsive UI

## Usage

1. Open `index.html` in a web browser
2. Fill in the required fields:
   - **Organization Name**: The GitHub organization (e.g., `facebook`)
   - **Repository Name**: The repository name (e.g., `react`)
   - **GitHub Token**: A personal access token with `repo` scope
   - **Date Range**: Either specify a date range (From/To) OR number of days
   - **Team Name** (optional): Filter reviewers by team name
3. Click "See Metrics" to fetch and display the data

## GitHub Token

To use this tool, you need a GitHub personal access token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Copy the token and paste it into the form

## How It Works

The application:
1. Fetches all pull requests in the specified repository within the date range
2. Retrieves all reviews for each pull request
3. Filters reviews by the specified date range
4. Optionally filters reviewers by team membership
5. Calculates metrics for each reviewer including percentages
6. Displays the results in an easy-to-read format

## Local Development

Simply open the `index.html` file in a web browser. No build process required.

Alternatively, you can serve it with a local HTTP server:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.