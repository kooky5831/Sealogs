import gql from 'graphql-tag'

export const GET_INVENTORIES_WITH_DOCUMENTS = gql`
    query getInventoriesListWithDocuments {
        readInventories {
            nodes {
                id
                item
                location
                documents {
                    nodes {
                        id
                        fileFilename
                        name
                        title
                        created
                    }
                }
                description
                title
            }
        }
    }
`
