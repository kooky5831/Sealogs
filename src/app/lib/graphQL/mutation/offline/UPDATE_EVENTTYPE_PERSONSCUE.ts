import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE_PERSONSCUE = gql`
    mutation UpdateEventType_PersonRescue(
        $input: UpdateEventType_PersonRescueInput!
    ) {
        updateEventType_PersonRescue(input: $input) {
            id
        }
    }
`
