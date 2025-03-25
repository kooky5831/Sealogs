import gql from 'graphql-tag'

export const CreateCustomisedLogBookConfig = gql`
    mutation CreateCustomisedLogBookConfig(
        $input: CreateCustomisedLogBookConfigInput!
    ) {
        createCustomisedLogBookConfig(input: $input) {
            id
        }
    }
`
