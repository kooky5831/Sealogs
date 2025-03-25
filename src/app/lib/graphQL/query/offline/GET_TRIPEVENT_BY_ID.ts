import gql from 'graphql-tag'

export const GET_TRIPEVENT_BY_ID = gql`
    query GetTripEventById($id: ID!) {
        readOneTripEvent(filter: { id: { eq: $id } }) {
            id
        }
    }
`
