import gql from 'graphql-tag'

export const GET_GEOLOCATION_BY_ID = gql`
    query GetGeoLocationById($id: ID!) {
        readOneGeoLocation(filter: { id: { eq: $id } }) {
            id
        }
    }
`
