import gql from 'graphql-tag'

export const CREATE_MAINTENANCESCHEDULESUBTASKS = gql`
    mutation createMaintenanceScheduleSubTask(
        $input: CreateMaintenanceScheduleSubTaskInput!
    ) {
        createMaintenanceScheduleSubTask(input: $input) {
            id
        }
    }
`