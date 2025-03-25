import gql from 'graphql-tag'
export const CREATE_GEO_LOCATION = gql`
    mutation CreateGeoLocation($input: CreateGeoLocationInput!) {
        createGeoLocation(input: $input) {
            title
            id
            lat
            long
        }
    }
`
