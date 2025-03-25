import gql from 'graphql-tag'

export const UPDATE_FUELTANK = gql`
    mutation UpdateFuelTank($input: UpdateFuelTankInput!) {
        updateFuelTank(input: $input) {
            id
        }
    }
`
