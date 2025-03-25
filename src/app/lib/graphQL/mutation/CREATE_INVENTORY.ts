import gql from 'graphql-tag'

export const CREATE_INVENTORY = gql`
    mutation CreateInventory($input: CreateInventoryInput!) {
        createInventory(input: $input) {
            id
            item
        }
    }
`
