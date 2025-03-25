import gql from 'graphql-tag'

export const DownloadLikelihoods = gql`
    query DownloadLikelihoods($limit: Int = 100, $offset: Int = 0) {
        readLikelihoods(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                name
                description
                backgroundColour
                textColour
                number
            }
        }
    }
`
