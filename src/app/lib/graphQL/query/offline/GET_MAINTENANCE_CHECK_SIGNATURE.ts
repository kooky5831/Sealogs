import gql from 'graphql-tag'

export const GET_MAINTENANCE_CHECK_SIGNATURE = gql`
    query GetMaintenanceCheck_Signature($id: ID!) {
        readOneMaintenanceCheck_Signature(filter: { id: { eq: $id } }) {
            id
        }
    }
`