import gql from 'graphql-tag'

export const CREATE_GEOLOCATION = gql`
    mutation CreateGeoLocation($input: CreateGeoLocationInput!) {
        createGeoLocation(input: $input) {
            id
        }
    }
`