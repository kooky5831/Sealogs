import gql from 'graphql-tag'

export const UPDATE_COMPONENT_MAINTENANCE_SCHEDULE = gql`
    mutation UpdateComponentMaintenanceSchedule(
        $input: UpdateComponentMaintenanceScheduleInput!
    ) {
        updateComponentMaintenanceSchedule(input: $input) {
            id
        }
    }
`
