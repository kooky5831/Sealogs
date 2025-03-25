import gql from 'graphql-tag'

export const DownloadGeoLocations = gql`
    query DownloadGeoLocations($limit: Int = 100, $offset: Int = 0) {
        readGeoLocations(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                title
                lat
                long
            }
        }
    }
`
