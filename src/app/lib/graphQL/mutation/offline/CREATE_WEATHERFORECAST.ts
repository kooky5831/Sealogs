import gql from 'graphql-tag'

export const CREATE_WEATHERFORECAST = gql`
    mutation CreateWeatherForecast($input: CreateWeatherForecastInput!) {
        createWeatherForecast(input: $input) {
            id
        }
    }
`