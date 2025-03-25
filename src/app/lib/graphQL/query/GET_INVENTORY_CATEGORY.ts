import gql from 'graphql-tag'

export const GET_INVENTORY_CATEGORY = gql`
    query {
        readInventoryCategories {
            nodes {
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
    }
`
