import gql from 'graphql-tag'

export const CREATE_SUPPLIER = gql`
    mutation CreateSupplier($input: CreateSupplierInput!) {
        createSupplier(input: $input) {
            id
            name
        }
    }
`
