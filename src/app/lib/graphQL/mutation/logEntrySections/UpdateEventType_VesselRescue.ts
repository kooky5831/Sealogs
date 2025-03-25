import gql from 'graphql-tag'

export const UpdateEventType_VesselRescue = gql`
    mutation UpdateEventType_VesselRescue(
        $input: UpdateEventType_VesselRescueInput!
    ) {
        updateEventType_VesselRescue(input: $input) {
            id
        }
    }
`
