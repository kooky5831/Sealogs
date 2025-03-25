import gql from 'graphql-tag'

export const DELETE_SUPPLIER = gql`
    mutation DeleteSupplier($id: Int!) {
        deleteSupplier(ID: $id) {
            isSuccess
            data
        }
    }
`
