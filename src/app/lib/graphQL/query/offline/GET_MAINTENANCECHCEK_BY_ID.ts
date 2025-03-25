import gql from 'graphql-tag'

export const GET_MAINTENANCECHCEK_BY_ID = gql`
    query GetMaintenanceCheckById($id: ID!) {
        readOneMaintenanceCheck(filter: { id: { eq: $id } }) {
            id
        }
    }
`
