import gql from 'graphql-tag'

export const CreateTripEvent = gql`
    mutation CreateTripEvent($input: CreateTripEventInput!) {
        createTripEvent(input: $input) {
            id
        }
    }
`
