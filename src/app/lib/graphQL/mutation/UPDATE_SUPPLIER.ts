import gql from 'graphql-tag'

export const UPDATE_SUPPLIER = gql`
    mutation UpdateSupplier($input: UpdateSupplierInput!) {
        updateSupplier(input: $input) {
            id
        }
    }
`
