import gql from 'graphql-tag'

export const CREATE_EVENTTYPE_TASKING = gql`
    mutation CreateEventType_Tasking($input: CreateEventType_TaskingInput!) {
        createEventType_Tasking(input: $input) {
            id
            tripEventID
        }
    }
`
