import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE_PASSENGERDROPFACILITY = gql`
    mutation UpdateEventType_PassengerDropFacility(
        $input: UpdateEventType_PassengerDropFacilityInput!
    ) {
        updateEventType_PassengerDropFacility(input: $input) {
            id
        }
    }
`
