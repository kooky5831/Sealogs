import gql from 'graphql-tag'

export const UPDATE_WEATHERTIDE = gql`
    mutation UpdateWeatherTide($input: UpdateWeatherTideInput!) {
        updateWeatherTide(input: $input) {
            id
        }
    }
`