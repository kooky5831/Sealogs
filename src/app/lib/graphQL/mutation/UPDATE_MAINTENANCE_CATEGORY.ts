import gql from 'graphql-tag'

export const UPDATE_MAINTENANCE_CATEGORY = gql`
    mutation UpdateMaintenanceCategory(
        $input: UpdateMaintenanceCategoryInput!
    ) {
        updateMaintenanceCategory(input: $input) {
            id
            name
        }
    }
`
