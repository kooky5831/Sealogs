import gql from 'graphql-tag'

export const UPDATE_COMPONENT_MAINTENANCE_SIGNATURE = gql`
    mutation UpdateMaintenanceCheck_Signature(
        $input: UpdateMaintenanceCheck_SignatureInput!
    ) {
        updateMaintenanceCheck_Signature(input: $input) {
            id
        }
    }
`
