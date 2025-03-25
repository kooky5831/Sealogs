import gql from 'graphql-tag'

export const GET_FAVORITELOCATION_BY_ID = gql`
    query Get_FavoriteLocationById($id: ID!) {
        readOneFavoriteLocation(filter: { id: { eq: $id } }) {
            id
        }
    }
`