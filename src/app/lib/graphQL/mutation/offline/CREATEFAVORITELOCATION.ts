import gql from 'graphql-tag'

export const CREATEFAVORITELOCATION = gql`
    mutation CreateFavoriteLocation($input: CreateFavoriteLocationInput!) {
        createFavoriteLocation(input: $input) {
            id
        }
    }
`