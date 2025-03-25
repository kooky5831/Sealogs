import gql from 'graphql-tag'

export const UPDATE_MAINTENANCE_CHECK_SIGNATURES = gql`
    mutation updateMaintenanceCheck_Signature(
        $input: UpdateMaintenanceCheck_SignatureInput!
    ) {
        updateMaintenanceCheck_Signature(input: $input) {
            id
        }
    }
`