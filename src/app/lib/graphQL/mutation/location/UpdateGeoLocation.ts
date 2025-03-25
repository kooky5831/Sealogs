import gql from 'graphql-tag'

export const UpdateGeoLocation = gql`
    mutation UpdateGeoLocation($input: UpdateGeoLocationInput!) {
        updateGeoLocation(input: $input) {
            id
        }
    }
`
