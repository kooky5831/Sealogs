import gql from 'graphql-tag'

export const GET_MAINTENANCE_CHECK_SUBTASK = gql`
    query GetMaintenanceCheckSubTask($id: ID!) {
        readMaintenanceCheckSubTasks(
            filter: { componentMaintenanceCheckID: { eq: $id } }
        ) {
            nodes {
                id
                status
                findings
                dateCompleted
                maintenanceScheduleSubTask {
                    id
                    task
                    description
                    inventoryID
                }
                completedBy {
                    id
                    firstName
                    surname
                }
            }
        }
    }
`
