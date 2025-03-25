import gql from 'graphql-tag'

export const UPDATE_MAINTENANCECHECK = gql`
    mutation UpdateMaintenanceCheck($input: UpdateMaintenanceCheckInput!) {
        updateMaintenanceCheck(input: $input) {
            id
        }
    }
`