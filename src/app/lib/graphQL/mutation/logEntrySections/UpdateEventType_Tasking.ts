import gql from 'graphql-tag'

export const UpdateEventType_Tasking = gql`
    mutation UpdateEventType_Tasking($input: UpdateEventType_TaskingInput!) {
        updateEventType_Tasking(input: $input) {
            id
        }
    }
`
