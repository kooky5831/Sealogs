import gql from 'graphql-tag'

export const DELETE_COMPONENT_MAINTENANCE_CHECK = gql`
    mutation DeleteComponentMaintenanceChecks($id: [ID]!) {
        deleteComponentMaintenanceChecks(ids: $id)
    }
`
