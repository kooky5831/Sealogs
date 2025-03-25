import gql from 'graphql-tag'

export const DownloadRiskRatings = gql`
    query DownloadRiskRatings($limit: Int = 100, $offset: Int = 0) {
        readRiskRatings(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                name
                backgroundColour
                textColour
            }
        }
    }
`
