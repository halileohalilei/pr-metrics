import { GraphQLClient } from 'graphql-request'

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

export function createGitHubClient(token: string, signal?: AbortSignal): GraphQLClient {
  return new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    signal,
  })
}

