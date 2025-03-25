import gql from 'graphql-tag'

export const UPDATE_ADDRESS = gql`
    mutation UpdateAddress($input: UpdateAddressInput!) {
        updateAddress(input: $input) {
            id
        }
    }
`
