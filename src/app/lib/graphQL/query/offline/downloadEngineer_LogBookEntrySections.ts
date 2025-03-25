import gql from 'graphql-tag'

export const DownloadEngineer_LogBookEntrySections = gql`
    query DownloadEngineer_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readEngineer_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
            }
        }
    }
`
