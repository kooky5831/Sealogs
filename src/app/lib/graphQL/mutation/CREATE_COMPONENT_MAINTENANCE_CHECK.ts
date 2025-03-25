import gql from 'graphql-tag'

export const CREATE_COMPONENT_MAINTENANCE_CHECK = gql`
    mutation CreateComponentMaintenanceCheck(
        $input: CreateComponentMaintenanceCheckInput!
    ) {
        createComponentMaintenanceCheck(input: $input) {
            id
        }
    }
`
