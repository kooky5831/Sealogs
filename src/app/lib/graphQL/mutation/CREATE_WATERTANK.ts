import gql from 'graphql-tag'

export const CREATE_WATERTANK = gql`
    mutation CreateWaterTank($input: CreateWaterTankInput!) {
        createWaterTank(input: $input) {
            id
        }
    }
`
