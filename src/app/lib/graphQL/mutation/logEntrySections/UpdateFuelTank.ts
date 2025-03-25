import gql from 'graphql-tag'

export const UpdateFuelTank = gql`
    mutation UpdateFuelTank($input: UpdateFuelTankInput!) {
        updateFuelTank(input: $input) {
            id
        }
    }
`
