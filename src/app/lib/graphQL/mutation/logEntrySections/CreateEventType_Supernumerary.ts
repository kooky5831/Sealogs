import gql from 'graphql-tag'

export const CreateEventType_Supernumerary = gql`
    mutation CreateEventType_Supernumerary(
        $input: CreateEventType_SupernumeraryInput!
    ) {
        createEventType_Supernumerary(input: $input) {
            id
        }
    }
`
