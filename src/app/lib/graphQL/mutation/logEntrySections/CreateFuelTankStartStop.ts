import gql from 'graphql-tag'

export const CreateFuelTankStartStop = gql`
    mutation CreateFuelTankStartStop($input: CreateFuelTankStartStopInput!) {
        createFuelTankStartStop(input: $input) {
            id
        }
    }
`
