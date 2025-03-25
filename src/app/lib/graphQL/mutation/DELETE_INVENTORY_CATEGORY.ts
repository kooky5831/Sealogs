import gql from 'graphql-tag'

export const DELETE_INVENTORY_CATEGORY = gql`
    mutation DeleteInventoryCategory($id: Int!) {
        deleteInventoryCategory(ID: $id) {
            isSuccess
            data
        }
    }
`
