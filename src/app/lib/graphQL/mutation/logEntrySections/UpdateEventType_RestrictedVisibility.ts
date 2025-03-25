import gql from 'graphql-tag'

export const UpdateEventType_RestrictedVisibility = gql`
    mutation UpdateEventType_RestrictedVisibility(
        $input: UpdateEventType_RestrictedVisibilityInput!
    ) {
        updateEventType_RestrictedVisibility(input: $input) {
            id
        }
    }
`
