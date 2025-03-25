import gql from 'graphql-tag'

export const CREATE_EVENTTYPE_RESTRICTEDVISIBILITY = gql`
    mutation CreateEventType_RestrictedVisibility(
        $input: CreateEventType_RestrictedVisibilityInput!
    ) {
        createEventType_RestrictedVisibility(input: $input) {
            id
        }
    }
`
