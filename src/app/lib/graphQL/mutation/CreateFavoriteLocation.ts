import gql from 'graphql-tag'

export const CreateFavoriteLocation = gql`
    mutation CreateFavoriteLocation($input: CreateFavoriteLocationInput!) {
        createFavoriteLocation(input: $input) {
            id
        }
    }
`
