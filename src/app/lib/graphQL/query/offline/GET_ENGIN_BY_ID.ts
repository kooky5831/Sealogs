import gql from 'graphql-tag'

export const GET_ENGIN_BY_ID = gql`
    query Get_EnginById($id: ID!) {
        readOneEngine(filter: { id: { eq: $id } }) {
            id
        }
    }
`