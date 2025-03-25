import gql from 'graphql-tag'

export const GET_EVENTTYPE_BY_ID = gql`
    query GetEventTypeById($id: ID!) {
        readOneEventType(filter: { id: { eq: $id } }) {
            id
        }
    }
`
