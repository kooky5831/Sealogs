import gql from 'graphql-tag'

export const CREATE_EVENTTYPE = gql`
    mutation CreateEventType($input: CreateEventTypeInput!) {
        createEventType(input: $input) {
            id
            tripEventID
        }
    }
`
