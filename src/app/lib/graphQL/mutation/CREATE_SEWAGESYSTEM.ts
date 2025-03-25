import gql from 'graphql-tag'

export const CREATE_SEWAGESYSTEM = gql`
    mutation CreateSewageSystem($input: CreateSewageSystemInput!) {
        createSewageSystem(input: $input) {
            id
        }
    }
`
