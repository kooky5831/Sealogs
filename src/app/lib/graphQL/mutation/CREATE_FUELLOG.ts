import gql from 'graphql-tag'

export const CREATE_FUELLOG = gql`
    mutation CreateFuelLog($input: CreateFuelLogInput!) {
        createFuelLog(input: $input) {
            id
        }
    }
`
