import gql from 'graphql-tag'

export const CREATE_EVENTTYPE_PASSENGERDROPFACLIITY = gql`
    mutation CreateEventType_PassengerDropFacility(
        $input: CreateEventType_PassengerDropFacilityInput!
    ) {
        createEventType_PassengerDropFacility(input: $input) {
            id
        }
    }
`
