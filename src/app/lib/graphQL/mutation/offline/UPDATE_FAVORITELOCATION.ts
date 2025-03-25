import gql from 'graphql-tag'

export const UPDATE_FAVORITELOCATION = gql`
    mutation Update_FavoriteLocation($input: UpdateFavoriteLocationInput!) {
        updateFavoriteLocation(input: $input) {
            id
        }
    }
`