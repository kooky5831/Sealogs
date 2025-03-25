import gql from 'graphql-tag'

export const GET_VEHICLEPOSITION_BY_ID = gql`
    query GetVehiclePositionById($id: ID!) {
        readOneVehiclePosition(filter: { id: { eq: $id } }) {
            id
        }
    }
`
