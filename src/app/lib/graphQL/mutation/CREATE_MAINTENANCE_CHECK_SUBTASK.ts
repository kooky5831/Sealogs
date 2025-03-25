import gql from 'graphql-tag'

export const CREATE_MAINTENANCE_CHECK_SUBTASK = gql`
    mutation CreateMaintenanceCheckSubTask(
        $input: CreateMaintenanceCheckSubTaskInput!
    ) {
        createMaintenanceCheckSubTask(input: $input) {
            id
            status
            findings
            maintenanceScheduleSubTask {
                task
                description
            }
            completedBy {
                id
                firstName
                surname
            }
        }
    }
`
