import gql from 'graphql-tag'

export const UPDATE_COMPONENT_MAINTENANCE_CHECK = gql`
    mutation UpdateComponentMaintenanceCheck(
        $input: UpdateComponentMaintenanceCheckInput!
    ) {
        updateComponentMaintenanceCheck(input: $input) {
            id
        }
    }
`
