import gql from 'graphql-tag'

export const CREATE_CUSTOMISED_LOGBOOK_COMPONENT = gql`
    mutation CreateCustomisedLogBookComponent(
        $input: CreateCustomisedLogBookComponentInput!
    ) {
        createCustomisedLogBookComponent(input: $input) {
            id
        }
    }
`
