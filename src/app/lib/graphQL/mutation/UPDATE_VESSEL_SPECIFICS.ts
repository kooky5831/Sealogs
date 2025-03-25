import gql from 'graphql-tag'

export const UPDATE_VESSEL_SPECIFICS = gql`
    mutation UpdateVesselSpecifics($input: UpdateVesselSpecificsInput!) {
        updateVesselSpecifics(input: $input) {
            id
        }
    }
`
