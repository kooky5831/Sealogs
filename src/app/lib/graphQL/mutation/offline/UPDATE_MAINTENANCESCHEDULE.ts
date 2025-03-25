import gql from 'graphql-tag'

export const UPDATE_MAINTENANCESCHEDULE = gql`
    mutation UpdateMaintenanceSchedule($input: UpdateMaintenanceScheduleInput!) {
        updateMaintenanceSchedule(input: $input) {
            id
        }
    }
`