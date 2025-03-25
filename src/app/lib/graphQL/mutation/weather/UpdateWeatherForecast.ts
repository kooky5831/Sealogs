import gql from 'graphql-tag'

export const UpdateWeatherForecast = gql`
    mutation UpdateWeatherForecast($input: UpdateWeatherForecastInput!) {
        updateWeatherForecast(input: $input) {
            id
        }
    }
`
