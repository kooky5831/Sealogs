import gql from 'graphql-tag'

export const DownloadTrainingLocations = gql`
    query DownloadTrainingLocations($limit: Int = 100, $offset: Int = 0) {
        readTrainingLocations(limit: $limit, offset: $offset) {
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
