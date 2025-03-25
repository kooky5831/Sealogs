import gql from 'graphql-tag'

export const UpdateWeatherTide = gql`
    mutation UpdateWeatherTide($input: UpdateWeatherTideInput!) {
        updateWeatherTide(input: $input) {
            id
        }
    }
`
