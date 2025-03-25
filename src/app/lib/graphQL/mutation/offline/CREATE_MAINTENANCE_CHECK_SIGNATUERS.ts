import gql from 'graphql-tag'

export const CREATE_MAINTENANCE_CHECK_SIGNATUERS = gql`
    mutation createMaintenanceCheck_Signature(
        $input: CreateMaintenanceCheck_SignatureInput!
    ) {
        createMaintenanceCheck_Signature(input: $input) {
            id
        }
    }
`