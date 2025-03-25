import gql from 'graphql-tag'

export const DownloadRefuellingBunkerings = gql`
    query DownloadRefuellingBunkerings($limit: Int = 100, $offset: Int = 0) {
        readRefuellingBunkerings(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                date
                title
                lat
                long
                notes
                tripEventID
                geoLocationID
            }
        }
    }
`
