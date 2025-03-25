import gql from 'graphql-tag'

export const TRAINING_SESSION_BY_ID = gql`
    query GetTrainingSession($id: ID!) {
        readOneTrainingSession(filter: { id: { eq: $id } }) {
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
            trainer {
                id
                firstName
                surname
            }
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
            trainingLocationType
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
            fuelLevel
            geoLocationID
            geoLocation {
                id
                title
                lat
                long
            }
            startTime
            finishTime
            lat
            long
        }
    }
`
