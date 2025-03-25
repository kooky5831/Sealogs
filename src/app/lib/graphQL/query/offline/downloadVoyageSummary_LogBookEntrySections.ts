import gql from 'graphql-tag'

export const DownloadVoyageSummary_LogBookEntrySections = gql`
    query DownloadVoyageSummary_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readVoyageSummary_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                logBookComponentClass
                subView
                sortOrder
                clientID
                logBookEntryID
                sectionSignatureID
                createdByID
                riverFlowID
                oktas
                windStrength
                windDirection
                precipitation
                visibility
                swell
                seaState
                courseSteered
                courseOverGround
                changesToPlan
                speedOverGround
                vesselRPM
                typeOfSteering
                voyageDistance
                weatherComments
                forecastComment
                activities
                tripEvents {
                    nodes {
                        id
                        start
                        end
                        numberPax
                        cause
                        notes
                        location
                        created
                        vehicle
                        eventType {
                            id
                            title
                        }
                        seaLogsMember {
                            id
                            firstName
                            surname
                        }
                    }
                }
            }
        }
    }
`
