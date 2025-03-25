import gql from 'graphql-tag'

export const GET_EVENTTYPE_TASKING = gql`
    query GetEventTypeTasking($id: ID!) {
        readOneEventType_Tasking(filter: { id: { eq: $id } }) {
            id
        }
    }
`
