import gql from 'graphql-tag'

export const GET_EVENTTYPE_SUPERNUMERARY = gql`
    query ReadOneEventType_Supernumerary($id: ID!) {
        readOneEventType_Supernumerary(filter: { id: { eq: $id } }) {
            id
        }
    }
`
