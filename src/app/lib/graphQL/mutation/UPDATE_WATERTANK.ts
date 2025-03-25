import gql from 'graphql-tag'

export const UPDATE_WATERTANK = gql`
    mutation UpdateWaterTank($input: UpdateWaterTankInput!) {
        updateWaterTank(input: $input) {
            id
        }
    }
`
