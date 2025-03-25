import gql from 'graphql-tag'

export const CreateEventType_PersonRescue = gql`
    mutation CreateEventType_PersonRescue(
        $input: CreateEventType_PersonRescueInput!
    ) {
        createEventType_PersonRescue(input: $input) {
            id
        }
    }
`
