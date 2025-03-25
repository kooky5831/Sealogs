import gql from 'graphql-tag'

export const UpdateEventType_PassengerDropFacility = gql`
    mutation UpdateEventType_PassengerDropFacility(
        $input: UpdateEventType_PassengerDropFacilityInput!
    ) {
        updateEventType_PassengerDropFacility(input: $input) {
            id
        }
    }
`
