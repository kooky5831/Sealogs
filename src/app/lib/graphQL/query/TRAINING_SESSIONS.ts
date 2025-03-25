import gql from 'graphql-tag'

export const TRAINING_SESSIONS = gql`
    query ReadTrainingSessions(
        $limit: Int = 0
        $offset: Int = 0
        $filter: TrainingSessionFilterFields = {}
    ) {
        readTrainingSessions(limit: $limit, offset: $offset, filter: $filter) {
            pageInfo {
                totalCount
                hasNextPage
                hasPreviousPage
            }
            nodes {
                id
                date
                logBookEntryID
                members {
                    nodes {
                        id
                        firstName
                        surname
                    }
                }
                trainerID
                trainer {
                    id
                    firstName
                    surname
                }
                trainingLocationType
                signatures {
                    nodes {
                        id
                        signatureData
                        member {
                            id
                            firstName
                            surname
                        }
                    }
                }
                trainingLocation {
                    id
                    title
                }
                trainingSummary
                trainingTypes {
                    nodes {
                        id
                        title
                        procedure
                        occursEvery
                        highWarnWithin
                        mediumWarnWithin
                    }
                }
                vessel {
                    id
                    title
                }
            }
        }
    }
`
