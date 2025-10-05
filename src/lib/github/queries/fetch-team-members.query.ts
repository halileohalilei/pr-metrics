import { gql } from "graphql-request";

export const FETCH_TEAM_MEMBERS_QUERY = gql`
  query FetchTeamMembers($org: String!, $teamSlug: String!, $cursor: String) {
    organization(login: $org) {
      team(slug: $teamSlug) {
        members(first: 100, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            login
          }
        }
      }
    }
  }
`;
