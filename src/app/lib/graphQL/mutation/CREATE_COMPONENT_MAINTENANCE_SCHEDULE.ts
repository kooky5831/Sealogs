import gql from 'graphql-tag'

export const CREATE_COMPONENT_MAINTENANCE_SCHEDULE = gql`
    mutation CreateComponentMaintenanceSchedule(
        $input: CreateComponentMaintenanceScheduleInput!
    ) {
        createComponentMaintenanceSchedule(input: $input) {
            id
        }
    }
`
