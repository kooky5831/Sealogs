import gql from 'graphql-tag'

export const CREATE_CLIENT = gql`
    mutation createClient(
        $input: CreateClientInput!
    ) {
        createClient(input: $input) {
            id
        }
    }
`