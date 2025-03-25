import gql from 'graphql-tag'

export const GET_COMPONENTMAINTENANCESCHEDULE_BY_ID = gql`
    query Get_ComponenMaintenanceScheduleById($id: ID!) {
        readOneComponentMaintenanceSchedule(filter: { id: { eq: $id } }) {
            id
        }
    }
`