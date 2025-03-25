import gql from 'graphql-tag'

export const CREATE_EVENTTYPE_SUPERNUMERARY = gql`
    mutation CreateEventType_Supernumerary(
        $input: CreateEventType_SupernumeraryInput!
    ) {
        createEventType_Supernumerary(input: $input) {
            id
        }
    }
`
