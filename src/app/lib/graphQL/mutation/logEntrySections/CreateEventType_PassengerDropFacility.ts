import gql from 'graphql-tag'

export const CreateEventType_PassengerDropFacility = gql`
    mutation CreateEventType_PassengerDropFacility(
        $input: CreateEventType_PassengerDropFacilityInput!
    ) {
        createEventType_PassengerDropFacility(input: $input) {
            id
        }
    }
`
