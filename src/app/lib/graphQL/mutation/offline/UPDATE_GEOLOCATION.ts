import gql from 'graphql-tag'

export const UPDATE_GEOLOCATION = gql`
    mutation UpdateGeoLocation($input: UpdateGeoLocationInput!) {
        updateGeoLocation(input: $input) {
            id
        }
    }
`
