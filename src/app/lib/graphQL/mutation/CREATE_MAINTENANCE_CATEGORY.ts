import gql from 'graphql-tag'

export const CREATE_MAINTENANCE_CATEGORY = gql`
    mutation CreateMaintenanceCategory(
        $input: CreateMaintenanceCategoryInput!
    ) {
        createMaintenanceCategory(input: $input) {
            id
            name
        }
    }
`
