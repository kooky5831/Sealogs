import gql from 'graphql-tag'

export const CREATE_WEATHERTIDE = gql`
    mutation CreateWeatherTide($input: CreateWeatherTideInput!) {
        createWeatherTide(input: $input) {
            id
        }
    }
`