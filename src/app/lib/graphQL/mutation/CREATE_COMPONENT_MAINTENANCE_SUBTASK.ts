import gql from 'graphql-tag'

export const CREATE_COMPONENT_MAINTENANCE_SUBTASK = gql`
    mutation CreateMaintenanceScheduleSubTask(
        $input: CreateMaintenanceScheduleSubTaskInput!
    ) {
        createMaintenanceScheduleSubTask(input: $input) {
            id
        }
    }
`
