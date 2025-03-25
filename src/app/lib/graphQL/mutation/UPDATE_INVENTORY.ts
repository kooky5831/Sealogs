import gql from 'graphql-tag'

export const UPDATE_INVENTORY = gql`
    mutation UpdateInventory($input: UpdateInventoryInput!) {
        updateInventory(input: $input) {
            id
        }
    }
`
