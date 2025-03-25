import gql from 'graphql-tag'

export const UPDATE_CUSTOMISED_COMPONENT_FIELD = gql`
    mutation UpdateCustomisedComponentField(
        $input: UpdateCustomisedComponentFieldInput!
    ) {
        updateCustomisedComponentField(input: $input) {
            id
        }
    }
`
