import gql from 'graphql-tag'

export const GET_MAINTENANCE_CATEGORY = gql`
    query GetMaintenanceCategories($clientID: ID!) {
        readMaintenanceCategories(filter: { clientID: { eq: $clientID } }) {
            nodes {
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
    }
`
