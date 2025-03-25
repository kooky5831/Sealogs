import gql from 'graphql-tag'

export const CreateEventType_VesselRescue = gql`
    mutation CreateEventType_VesselRescue(
        $input: CreateEventType_VesselRescueInput!
    ) {
        createEventType_VesselRescue(input: $input) {
            id
        }
    }
`
