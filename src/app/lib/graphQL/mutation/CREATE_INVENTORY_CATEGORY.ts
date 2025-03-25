import gql from 'graphql-tag'

export const CREATE_INVENTORY_CATEGORY = gql`
    mutation CreateInventoryCategory($input: CreateInventoryCategoryInput!) {
        createInventoryCategory(input: $input) {
            id
            name
            abbreviation
        }
    }
`
