import gql from 'graphql-tag'

export const DownloadMitigationStrategies = gql`
    query DownloadMitigationStrategies($limit: Int = 100, $offset: Int = 0) {
        readMitigationStrategies(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                strategy
            }
        }
    }
`
