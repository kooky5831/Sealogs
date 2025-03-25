import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE_VESSELRESCUE = gql`
    mutation UpdateEventType_VesselRescue(
        $input: UpdateEventType_VesselRescueInput!
    ) {
        updateEventType_VesselRescue(input: $input) {
            id
        }
    }
`
