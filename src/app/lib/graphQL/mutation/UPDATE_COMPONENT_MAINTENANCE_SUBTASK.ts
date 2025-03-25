import gql from 'graphql-tag'

export const UPDATE_COMPONENT_MAINTENANCE_SUBTASK = gql`
    mutation UpdateMaintenanceScheduleSubTask(
        $input: UpdateMaintenanceScheduleSubTaskInput!
    ) {
        updateMaintenanceScheduleSubTask(input: $input) {
            id
        }
    }
`
