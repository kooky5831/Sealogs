import gql from 'graphql-tag'

export const CreateWeatherTide = gql`
    mutation CreateWeatherTide($input: CreateWeatherTideInput!) {
        createWeatherTide(input: $input) {
            id
        }
    }
`
