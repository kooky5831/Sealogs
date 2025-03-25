import gql from 'graphql-tag'

export const CREATE_PARENT_COMPONENT = gql`
    mutation CreateParentComponent_Component(
        $input: CreateParentComponent_ComponentInput!
    ) {
        createParentComponent_Component(input: $input) {
            id
        }
    }
`
