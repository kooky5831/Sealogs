import gql from 'graphql-tag'

export const DownloadFavoriteLocations = gql`
    query DownloadFavoriteLocations($limit: Int = 100, $offset: Int = 0) {
        readFavoriteLocations(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                usage
                geoLocationID
                memberID
            }
        }
    }
`
