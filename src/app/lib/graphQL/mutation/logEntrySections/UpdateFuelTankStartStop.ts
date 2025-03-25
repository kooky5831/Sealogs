import gql from 'graphql-tag'

export const UpdateFuelTankStartStop = gql`
    mutation UpdateFuelTankStartStop($input: UpdateFuelTankStartStopInput!) {
        updateFuelTankStartStop(input: $input) {
            id
        }
    }
`
