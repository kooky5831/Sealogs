import gql from 'graphql-tag'

export const BarCrossingChecklist = gql`
    query GetBarCrossingChecklist($id: [ID]!) {
        readOneBarCrossingChecklist(filter: { id: { in: $id } }) {
            id
            stopAssessPlan
            crewBriefing
            weather
            stability
            waterTightness
            lifeJackets
            lookoutPosted
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
