import gql from 'graphql-tag'

export const UPDATE_INVENTORY_CATEGORY = gql`
    mutation UpdateInventoryCategory($input: UpdateInventoryCategoryInput!) {
        updateInventoryCategory(input: $input) {
            id
        }
    }
`
