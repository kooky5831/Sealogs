import gql from 'graphql-tag'

export const GET_INVENTORY_CATEGORY_BY_ID = gql`
    query GetInventoryCategoryByID($id: ID!) {
        readOneInventoryCategory(filter: { id: { eq: $id } }) {
            id
            name
            abbreviation
            archived
            clientID
            className
            lastEdited
            lastEdited
            client {
                id
                title
                phone
            }
            inventories {
                nodes {
                    id
                    title
                }
            }
        }
    }
`
