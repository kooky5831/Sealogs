import gql from 'graphql-tag'

export const CreateEventType_Tasking = gql`
    mutation CreateEventType_Tasking($input: CreateEventType_TaskingInput!) {
        createEventType_Tasking(input: $input) {
            id
            tripEventID
        }
    }
`
