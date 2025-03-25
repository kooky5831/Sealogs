import gql from 'graphql-tag'

export const CRATEEVENTTYPE_VESSELRESCUE = gql`
    mutation CreateEventType_VesselRescue(
        $input: CreateEventType_VesselRescueInput!
    ) {
        createEventType_VesselRescue(input: $input) {
            id
        }
    }
`