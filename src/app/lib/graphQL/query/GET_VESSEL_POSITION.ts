import gql from 'graphql-tag'

export const GET_VESSEL_POSITION = gql`
    query GetVehiclePosition($id: ID!) {
        readOneVehiclePosition(
            filter: { vehicle: { id: { eq: $id } } }
            sort: { created: DESC }
        ) {
            id
            time
            lat
            long
            geoLocation {
                id
                lat
                long
                title
            }
        }
    }
`
