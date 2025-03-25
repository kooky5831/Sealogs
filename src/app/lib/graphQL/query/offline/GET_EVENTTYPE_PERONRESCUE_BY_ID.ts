import gql from 'graphql-tag'

export const GET_EVENTTYPE_PERONRESCUE_BY_ID = gql`
    query GetEventTypePersonRescueById($id: ID!) {
        readOneEventType_PersonRescue(filter: { id: { eq: $id } }) {
            id
        }
    }
`
