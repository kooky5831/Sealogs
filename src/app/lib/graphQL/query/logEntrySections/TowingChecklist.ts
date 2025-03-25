import gql from 'graphql-tag'

export const TowingChecklist = gql`
    query GetTowingChecklist($id: [ID]!) {
        readOneTowingChecklist(filter: { id: { in: $id } }) {
            id
            conductSAP
            investigateNatureOfIssue
            everyoneOnBoardOk
            rudderToMidshipsAndTrimmed
            lifejacketsOn
            communicationsEstablished
            secureAndSafeTowing
            member {
                id
                firstName
                surname
            }
            riskFactors {
                nodes {
                    id
                    type
                    title
                    impact
                    probability
                    riskRating {
                        id
                    }
                    likelihood {
                        id
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
    }
`
