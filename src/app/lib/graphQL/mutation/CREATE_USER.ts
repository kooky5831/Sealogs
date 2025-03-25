import gql from 'graphql-tag'

export const CREATE_USER = gql`
    mutation CreateSeaLogsMember($input: CreateSeaLogsMemberInput!) {
        createSeaLogsMember(input: $input) {
            id
            firstName
            surname
        }
    }
`
