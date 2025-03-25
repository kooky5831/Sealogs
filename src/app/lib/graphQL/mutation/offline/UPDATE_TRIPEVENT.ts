import gql from 'graphql-tag'

export const UPDATE_TRIPEVENT = gql`
    mutation UpdateTripEvent($input: UpdateTripEventInput!) {
        updateTripEvent(input: $input) {
            id
        }
    }
`