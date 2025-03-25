import gql from 'graphql-tag'

export const UPDATE_VESSEL_POSITION = gql`
    mutation UpdateVehiclePosition($input: UpdateVehiclePositionInput!) {
        updateVehiclePosition(input: $input) {
            id
        }
    }
`
