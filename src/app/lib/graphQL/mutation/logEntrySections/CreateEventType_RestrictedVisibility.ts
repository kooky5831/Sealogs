import gql from 'graphql-tag'

export const CreateEventType_RestrictedVisibility = gql`
    mutation CreateEventType_RestrictedVisibility(
        $input: CreateEventType_RestrictedVisibilityInput!
    ) {
        createEventType_RestrictedVisibility(input: $input) {
            id
        }
    }
`
