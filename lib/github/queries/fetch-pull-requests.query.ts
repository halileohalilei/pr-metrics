import { gql } from 'graphql-request'

export const FETCH_PRS_QUERY = gql`
  query FetchPullRequests($owner: String!, $repo: String!, $cursor: String, $limit: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequests(first: $limit, after: $cursor, orderBy: { field: CREATED_AT, direction: DESC }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          state
          createdAt
          mergedAt
          closedAt
          updatedAt
          author {
            login
          }
          reviews(first: 50) {
            totalCount
            nodes {
              author {
                login
              }
              state
              createdAt
              submittedAt
            }
          }
          reviewRequests(first: 10) {
            totalCount
          }
          comments {
            totalCount
          }
          timelineItems(first: 50, itemTypes: [REVIEW_REQUESTED_EVENT, READY_FOR_REVIEW_EVENT]) {
            nodes {
              __typename
              ... on ReadyForReviewEvent {
                createdAt
              }
              ... on ReviewRequestedEvent {
                createdAt
              }
            }
          }
        }
      }
    }
  }
`

