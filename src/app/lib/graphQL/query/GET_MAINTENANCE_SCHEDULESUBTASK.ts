import gql from 'graphql-tag'

export const GET_MAINTENANCE_SCHEDULESUBTASK = gql`
    query Get_MaintenanceScheduleSubTask($id: ID!) {
        readOneMaintenanceScheduleSubTask( filter: { id: { eq: $id } }) {
            id
        }
    }
`