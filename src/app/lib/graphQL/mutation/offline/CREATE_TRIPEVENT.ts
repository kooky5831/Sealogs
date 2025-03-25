import gql from 'graphql-tag'

export const CREATE_TRIPEVENT = gql`
    mutation CreateTripEvent($input: CreateTripEventInput!) {
        createTripEvent(input: $input) {
            id
        }
    }
`