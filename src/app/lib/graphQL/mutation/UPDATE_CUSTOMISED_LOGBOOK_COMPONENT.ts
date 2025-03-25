import gql from 'graphql-tag'

export const UPDATE_CUSTOMISED_LOGBOOK_COMPONENT = gql`
    mutation UpdateCustomisedLogBookComponent(
        $input: UpdateCustomisedLogBookComponentInput!
    ) {
        updateCustomisedLogBookComponent(input: $input) {
            id
            active
        }
    }
`
