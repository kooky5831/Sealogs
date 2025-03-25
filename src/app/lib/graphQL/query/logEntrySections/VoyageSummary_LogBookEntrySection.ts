import gql from 'graphql-tag'

export const VoyageSummary_LogBookEntrySection = gql`
    query GetVoyageSummary_LogBookEntrySections($id: [ID]!) {
        readVoyageSummary_LogBookEntrySections(filter: { id: { in: $id } }) {
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
