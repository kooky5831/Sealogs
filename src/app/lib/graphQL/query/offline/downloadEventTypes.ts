import gql from 'graphql-tag'

export const DownloadEventTypes = gql`
    query DownloadEventTypes($limit: Int = 100, $offset: Int = 0) {
        readEventTypes(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                title
            }
        }
    }
`
