import gql from 'graphql-tag'

export const CREATE_VESSEL_POSITION = gql`
    mutation CreateVehiclePosition($input: CreateVehiclePositionInput!) {
        createVehiclePosition(input: $input) {
            id
        }
    }
`
