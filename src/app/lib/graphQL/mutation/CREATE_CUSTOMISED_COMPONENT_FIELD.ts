import gql from 'graphql-tag'

export const CREATE_CUSTOMISED_COMPONENT_FIELD = gql`
    mutation CreateCustomisedComponentField(
        $input: CreateCustomisedComponentFieldInput!
    ) {
        createCustomisedComponentField(input: $input) {
            id
        }
    }
`
