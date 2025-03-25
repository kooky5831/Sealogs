import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE = gql`
    mutation UpdateEventType($input: UpdateEventTypeInput!) {
        updateEventType(input: $input) {
            id
        }
    }
`
