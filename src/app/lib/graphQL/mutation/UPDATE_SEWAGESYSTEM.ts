import gql from 'graphql-tag'

export const UPDATE_SEWAGESYSTEM = gql`
    mutation UpdateSewageSystem($input: UpdateSewageSystemInput!) {
        updateSewageSystem(input: $input) {
            id
        }
    }
`
