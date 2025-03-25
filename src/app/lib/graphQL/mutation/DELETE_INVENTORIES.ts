import gql from 'graphql-tag'

export const DELETE_INVENTORIES = gql`
    mutation DeleteInventories($ids: [ID]!) {
        deleteInventories(ids: $ids)
    }
`
