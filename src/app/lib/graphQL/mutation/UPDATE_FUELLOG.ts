import gql from 'graphql-tag'

export const UPDATE_FUELLOG = gql`
    mutation UpdateFuelLog($input: UpdateFuelLogInput!) {
        updateFuelLog(input: $input) {
            id
        }
    }
`
