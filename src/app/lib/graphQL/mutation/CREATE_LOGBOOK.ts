import gql from 'graphql-tag'

export const CREATE_LOGBOOK = gql`
    mutation CreateLogBook($input: CreateLogBookInput!) {
        createLogBook(input: $input) {
            id
        }
    }
`
