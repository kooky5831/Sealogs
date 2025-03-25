import gql from 'graphql-tag'

export const UPDATE_CUSTOMISED_LOGBOOK_CONFIG = gql`
    mutation UpdateCustomisedLogBookConfig(
        $input: UpdateCustomisedLogBookConfigInput!
    ) {
        updateCustomisedLogBookConfig(input: $input) {
            id
        }
    }
`
