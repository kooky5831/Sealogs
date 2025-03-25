import gql from 'graphql-tag'

export const UPDATE_MAINTENANCESCHEDULESUBTASKS = gql`
    mutation updateMaintenanceScheduleSubTask(
        $input: UpdateMaintenanceScheduleSubTaskInput!
    ) {
        updateMaintenanceScheduleSubTask(input: $input) {
            id
        }
    }
`