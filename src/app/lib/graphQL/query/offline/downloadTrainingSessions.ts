import gql from 'graphql-tag'

export const DownloadTrainingSessions = gql`
    query DownloadTrainingSessions($limit: Int = 100, $offset: Int = 0) {
        readTrainingSessions(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                trainingSummary
                date
                trainingLocationType
                fuelLevel
                startTime
                finishTime
                lat
                long
                trainerID
                logBookEntrySectionID
                logBookEntryID
                vesselID
                trainingLocationID
                geoLocationID
                members {
                    nodes {
                        id
                        firstName
                        surname
                    }
                }
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
            }
        }
    }
`
