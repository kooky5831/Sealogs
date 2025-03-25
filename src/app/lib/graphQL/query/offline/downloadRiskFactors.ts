import gql from 'graphql-tag'

export const DownloadRiskFactors = gql`
    query DownloadRiskFactors($limit: Int = 100, $offset: Int = 0) {
        readRiskFactors(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                type
                title
                impact
                probability
                riskRatingID
                consequenceID
                likelihoodID
                towingChecklistID
                vesselID
                dangerousGoodsChecklistID
                barCrossingChecklistID
                mitigationStrategy {
                    nodes {
                        id
                        strategy
                    }
                }
            }
        }
    }
`
