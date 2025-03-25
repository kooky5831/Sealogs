import gql from 'graphql-tag'

export const GET_EVENTTYPE_PASSENGERDROPFACILITIY_BY_ID = gql`
    query GetEventTypePassengerDropFacilityById($id: ID!) {
        readOneEventType_PassengerDropFacility(filter: { id: { eq: $id } }) {
            id
        }
    }
`
