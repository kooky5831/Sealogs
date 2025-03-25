import gql from 'graphql-tag'

export const DELETE_MAINTENANCE_CATEGORY = gql`
    mutation DeleteMaintenanceCategory($id: Int!) {
        deleteMaintenanceCategory(ID: $id) {
            isSuccess
            data
        }
    }
`
