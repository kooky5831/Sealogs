import gql from 'graphql-tag'

export const DownloadCrewMembers_LogBookEntrySections = gql`
    query DownloadCrewMembers_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readCrewMembers_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                crewMemberID
                logBookEntryID
                dutyPerformedID
                punchIn
                punchOut
                workDetails
            }
        }
    }
`
