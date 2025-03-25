import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE_SUPERNUMERARY = gql`
    mutation UpdateEventType_Supernumerary(
        $input: UpdateEventType_SupernumeraryInput!
    ) {
        updateEventType_Supernumerary(input: $input) {
            id
        }
    }
`
