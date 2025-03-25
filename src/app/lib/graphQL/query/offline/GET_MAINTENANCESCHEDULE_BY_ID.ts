import gql from 'graphql-tag'

export const GET_MAINTENANCESCHEDULE_BY_ID = gql`
    query Get_MaintenanceScheduleById($id: ID!) {
        readOneMaintenanceSchedule(filter: { id: { eq: $id } }) {
            id
        }
    }
`
