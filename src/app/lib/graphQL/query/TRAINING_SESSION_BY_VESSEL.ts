import gql from 'graphql-tag'

export const TRAINING_SESSION_BY_VESSEL = gql`
    query GetTrainingSessions($vesselID: ID!) {
        readTrainingSessions(filter: { vesselID: { eq: $vesselID } }) {
            nodes {
                id
                date
                logBookEntrySectionID
                logBookEntryID
                members {
                    nodes {
                        id
                        firstName
                        surname
                    }
                }
                signatures {
                    nodes {
                        memberID
                        signatureData
                    }
                }
                trainingLocationType
                trainer {
                    id
                    firstName
                    surname
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
