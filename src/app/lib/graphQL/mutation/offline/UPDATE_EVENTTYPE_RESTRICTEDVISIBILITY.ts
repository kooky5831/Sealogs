import gql from 'graphql-tag'

export const UPDATE_EVENTTYPE_RESTRICTEDVISIBILITY = gql`
    mutation UpdateEventType_RestrictedVisibility(
        $input: UpdateEventType_RestrictedVisibilityInput!
    ) {
        updateEventType_RestrictedVisibility(input: $input) {
            id
        }
    }
`
