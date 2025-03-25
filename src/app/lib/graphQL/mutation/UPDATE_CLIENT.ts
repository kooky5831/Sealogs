import gql from 'graphql-tag'

export const UPDATE_CLIENT = gql`
    mutation UpdateClient($input: UpdateClientInput!) {
        updateClient(input: $input) {
            id
        }
    }
`
