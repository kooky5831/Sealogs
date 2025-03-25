import gql from 'graphql-tag'

export const TRAINING_TYPES = gql`
    query GetTrainingTypes {
        readTrainingTypes {
            nodes {
                id
                archived
                highWarnWithin
                mediumWarnWithin
                occursEvery
                procedure
                title
                trainingSessions {
                    nodes {
                        id
                        date
                        vessel {
                            id
                            title
                        }
                    }
                }
                vessels {
                    nodes {
                        id
                        title
                    }
                }
            }
        }
    }
`
