import gql from 'graphql-tag'

export const UpdateTripEvent = gql`
    mutation UpdateTripEvent($input: UpdateTripEventInput!) {
        updateTripEvent(input: $input) {
            id
        }
    }
`
