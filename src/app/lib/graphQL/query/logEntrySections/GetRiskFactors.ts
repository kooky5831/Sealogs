import gql from 'graphql-tag'

export const GetRiskFactors = gql`
    query GetRiskFactors($filter: RiskFactorFilterFields = {}) {
        readRiskFactors(filter: $filter, sort: { created: DESC }) {
            nodes {
                id
                type
                title
                impact
                probability
                dangerousGoodsChecklistID
                barCrossingChecklistID
                towingChecklistID
                dangerousGoodsChecklist {
                    member {
                        id
                        firstName
                        surname
                    }
                }
                barCrossingChecklist {
                    member {
                        id
                        firstName
                        surname
                    }
                }
                towingChecklist {
                    member {
                        id
                        firstName
                        surname
                    }
                }
                created
                vessel {
                    id
                    title
                }
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
