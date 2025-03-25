import gql from 'graphql-tag'

export const CREATE_MAINTENANCESCHEDULE = gql`
    mutation CreateMaintenanceSchedule($input: CreateMaintenanceScheduleInput!) {
        createMaintenanceSchedule(input: $input) {
            id
        }
    }
`