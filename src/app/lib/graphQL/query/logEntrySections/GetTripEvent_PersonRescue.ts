import gql from 'graphql-tag'

export const GetTripEvent_PersonRescue = gql`
    query GetTripEvent_PersonRescue($id: ID!) {
        readOneEventType_PersonRescue(filter: { id: { eq: $id } }) {
            id
            personName
            gender
            age
            personDescription
            cgMembershipNumber
            personOtherDetails
            cgMembershipType
            cgMembershipNumber
            missionID
            tripEventID
            operationType
            operationDescription
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
        }
    }
`
