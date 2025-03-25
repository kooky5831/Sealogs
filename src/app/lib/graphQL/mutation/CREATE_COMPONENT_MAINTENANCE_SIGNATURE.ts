import gql from 'graphql-tag'

export const CREATE_COMPONENT_MAINTENANCE_SIGNATURE = gql`
    mutation CreateMaintenanceCheck_Signature(
        $input: CreateMaintenanceCheck_SignatureInput!
    ) {
        createMaintenanceCheck_Signature(input: $input) {
            id
        }
    }
`
