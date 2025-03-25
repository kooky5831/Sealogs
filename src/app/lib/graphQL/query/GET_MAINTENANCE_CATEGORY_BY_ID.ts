import gql from 'graphql-tag'

export const GET_MAINTENANCE_CATEGORY_BY_ID = gql`
    query GetMaintenanceCategoryByID($id: ID!, $clientID: ID!) {
        readOneMaintenanceCategory(
            filter: { id: { eq: $id }, clientID: { eq: $clientID } }
        ) {
            id
            name
            abbreviation
            clientID
            className
            lastEdited
            client {
                id
                title
                phone
            }
            componentMaintenanceCheck {
                nodes {
                    id
                    name
                }
            }
        }
    }
`
