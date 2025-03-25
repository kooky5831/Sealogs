import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE_TASKING = gql`
    mutation UpdateEventType_Tasking($input: UpdateEventType_TaskingInput!) {
        updateEventType_Tasking(input: $input) {
            id
        }
    }
`
