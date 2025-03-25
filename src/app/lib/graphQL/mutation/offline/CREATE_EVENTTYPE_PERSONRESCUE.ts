import gql from 'graphql-tag'

export const CREATE_EVENTTYPE_PERSONRESCUE = gql`
    mutation CreateEventType_PersonRescue(
        $input: CreateEventType_PersonRescueInput!
    ) {
        createEventType_PersonRescue(input: $input) {
            id
        }
    }
`
