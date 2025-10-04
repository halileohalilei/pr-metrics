# PR Metrics

A Next.js web application to analyze GitHub Pull Request review metrics for teams and individuals.

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
- Beautiful, responsive UI built with Next.js and React

## Getting Started

### Prerequisites

- Node.js 20.x or higher (see `.nvmrc` for recommended version)
- npm or yarn or pnpm
- (Optional) [nvm](https://github.com/nvm-sh/nvm) for Node version management

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd pr-metrics
```

2. (Optional) If you use nvm, set the correct Node.js version:
```bash
nvm use
```

3. Install dependencies (including devDependencies):
```bash
npm install --include=dev
# or
yarn install
# or
pnpm install
```

**Note:** If you encounter issues with dependencies not installing, make sure to use the `--include=dev` flag with npm.

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
# or
pnpm build
pnpm start
```

## Usage

1. Open the application in your browser
2. Fill in the required fields:
   - **Organization Name**: The GitHub organization (e.g., `facebook`)
   - **Repository Name**: The repository name (e.g., `react`)
   - **GitHub Token**: A personal access token with `repo` scope
   - **Date Range**: Either specify a date range (From/To) OR number of days
   - **Team Name** (optional): Filter reviewers by team name
3. Click "See Metrics" to fetch and display the data

## GitHub Token

To use this tool, you need a GitHub personal access token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with the following scopes:
   - `repo` - Full control of private repositories
   - `read:org` - Read org and team membership (required for team filtering)
3. Copy the token and paste it into the form

**Note:** Your token is never stored and is only used for client-side GraphQL API calls.

## How It Works

The application:
1. Uses **GitHub GraphQL API (v4)** to efficiently fetch pull requests and reviews in a single query
2. Leverages **TanStack Query (React Query)** for optimized data fetching with automatic caching and error handling
3. Filters pull requests by the specified date range
4. Optionally fetches team members via GraphQL and filters reviewers by team membership
5. Calculates comprehensive metrics for each reviewer including percentages
6. Displays the results in an easy-to-read format with loading states

### Benefits of GraphQL + React Query

- **Efficient Data Fetching**: GraphQL allows fetching all necessary data in fewer requests compared to REST
- **Automatic Caching**: React Query caches responses to reduce unnecessary API calls
- **Better UX**: Built-in loading and error states with retry logic
- **Type Safety**: Full TypeScript support for all API responses

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **TanStack Query (React Query)** - Powerful data fetching and state management
- **GraphQL** - GitHub API v4 for efficient data fetching
- **graphql-request** - Lightweight GraphQL client

## Project Structure

```
pr-metrics/
├── app/
│   ├── layout.tsx       # Root layout with QueryProvider wrapper
│   └── page.tsx         # Home page
├── components/
│   ├── MetricsForm.tsx  # Main form with React Query mutation
│   └── QueryProvider.tsx # TanStack Query client provider
├── lib/
│   └── github-api.ts    # GitHub GraphQL API client and queries
├── .nvmrc               # Node.js version specification
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

## License

This project is open source and available under the MIT License.
