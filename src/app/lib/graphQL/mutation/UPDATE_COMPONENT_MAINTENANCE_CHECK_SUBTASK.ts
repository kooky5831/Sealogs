import gql from 'graphql-tag'

export const UPDATE_COMPONENT_MAINTENANCE_CHECK_SUBTASK = gql`
    mutation UpdateMaintenanceCheckSubTask(
        $input: UpdateMaintenanceCheckSubTaskInput!
    ) {
        updateMaintenanceCheckSubTask(input: $input) {
            id
            status
        }
    }
`
