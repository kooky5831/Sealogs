import gql from 'graphql-tag'

export const DownloadPorts_LogBookEntrySections = gql`
    query DownloadPorts_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readPorts_LogBookEntrySections(limit: $limit, offset: $offset) {
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
