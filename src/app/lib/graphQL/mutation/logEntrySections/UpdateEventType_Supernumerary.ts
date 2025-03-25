import gql from 'graphql-tag'

export const UpdateEventType_Supernumerary = gql`
    mutation UpdateEventType_Supernumerary(
        $input: UpdateEventType_SupernumeraryInput!
    ) {
        updateEventType_Supernumerary(input: $input) {
            id
        }
    }
`
