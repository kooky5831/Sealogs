import gql from 'graphql-tag'

export const CREATE_MAINTENANCECHECK = gql`
    mutation CreateMaintenanceCheck($input: CreateMaintenanceCheckInput!) {
        createMaintenanceCheck(input: $input) {
            id
        }
    }
`