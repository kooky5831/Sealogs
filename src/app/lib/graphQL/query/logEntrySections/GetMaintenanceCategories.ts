import gql from 'graphql-tag'

export const GetMaintenanceCategories = gql`
    query GetMaintenanceCategories($clientID: ID!) {
        readMaintenanceCategories(filter: { clientID: { eq: $clientID } }) {
            nodes {
                id
                name
                abbreviation
            }
        }
    }
`
