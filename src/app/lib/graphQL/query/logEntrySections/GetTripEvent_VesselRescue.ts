import gql from 'graphql-tag'

export const GetTripEvent_VesselRescue = gql`
    query GetTripEvent_VesselRescue($id: ID!) {
        readOneEventType_VesselRescue(filter: { id: { eq: $id } }) {
            id
            vesselName
            callSign
            pob
            latitude
            longitude
            locationDescription
            vesselLength
            vesselType
            makeAndModel
            color
            ownerName
            phone
            email
            address
            ownerOnBoard
            cgMembershipType
            cgMembership
            missionID
            vesselLocationID
            tripEventID
            operationType
            operationDescription
            vesselTypeDescription
            mission {
                id
                missionType
                description
                operationOutcome
                completedAt
                operationDescription
                eventType
                vesselPositionID
                currentLocation {
                    id
                    lat
                    long
                    title
                }
                missionTimeline(filter: { archived: { eq: false } }) {
                    nodes {
                        id
                        commentType
                        description
                        time
                        subTaskID
                        author {
                            id
                            firstName
                            surname
                            email
                        }
                    }
                }
            }
            missionTimeline(filter: { archived: { eq: false } }) {
                nodes {
                    id
                    commentType
                    description
                    time
                    subTaskID
                    author {
                        id
                        firstName
                        surname
                        email
                    }
                }
            }
            vesselLocation {
                id
                lat
                long
                title
            }
        }
    }
`
