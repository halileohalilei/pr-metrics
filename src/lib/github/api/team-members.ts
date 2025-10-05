import { GraphQLClient } from 'graphql-request'
import { FETCH_TEAM_MEMBERS_QUERY } from '../queries/fetch-team-members.query'
import { retryWithBackoff, delay } from '../utils/retry'

export async function fetchTeamMembers(
  client: GraphQLClient,
  org: string,
  teamSlug: string,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    const allMembers: string[] = []
    let hasNextPage = true
    let cursor: string | null = null

    console.log(`Fetching team members from ${org}/${teamSlug}...`)

    while (hasNextPage) {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Request cancelled')
      }
      
      const data: any = await retryWithBackoff(async () => {
        return await client.request(FETCH_TEAM_MEMBERS_QUERY, {
          org,
          teamSlug,
          cursor,
        })
      }, signal)

      if (!data.organization?.team) {
        console.warn('Team not found. Showing all reviewers.')
        return []
      }

      const members = data.organization.team.members.nodes
      const pageInfo = data.organization.team.members.pageInfo

      allMembers.push(...members.map((member: any) => member.login))

      hasNextPage = pageInfo.hasNextPage
      cursor = pageInfo.endCursor
      
      // Add a small delay between requests
      if (hasNextPage) {
        await delay(500)
      }
    }

    console.log(`Found ${allMembers.length} team members`)
    return allMembers
  } catch (error) {
    console.warn('Failed to fetch team members. Showing all reviewers.')
    return []
  }
}

