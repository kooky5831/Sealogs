import gql from 'graphql-tag'

export const CREATE_FUELTANK = gql`
    mutation CreateFuelTank($input: CreateFuelTankInput!) {
        createFuelTank(input: $input) {
            id
        }
    }
`
