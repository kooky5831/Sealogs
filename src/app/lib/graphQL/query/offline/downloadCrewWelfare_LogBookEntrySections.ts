import gql from 'graphql-tag'

export const DownloadCrewWelfare_LogBookEntrySections = gql`
    query DownloadCrewWelfare_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readCrewWelfare_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                fitness
                safetyActions
                waterQuality
                imSafe
                logBookEntryID
            }
        }
    }
`
