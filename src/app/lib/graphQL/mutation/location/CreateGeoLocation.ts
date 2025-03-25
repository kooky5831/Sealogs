import gql from 'graphql-tag'

export const CreateGeoLocation = gql`
    mutation CreateGeoLocation($input: CreateGeoLocationInput!) {
        createGeoLocation(input: $input) {
            id
        }
    }
`
