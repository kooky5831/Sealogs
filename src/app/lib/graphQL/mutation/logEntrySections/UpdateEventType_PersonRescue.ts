import gql from 'graphql-tag'

export const UpdateEventType_PersonRescue = gql`
    mutation UpdateEventType_PersonRescue(
        $input: UpdateEventType_PersonRescueInput!
    ) {
        updateEventType_PersonRescue(input: $input) {
            id
        }
    }
`
