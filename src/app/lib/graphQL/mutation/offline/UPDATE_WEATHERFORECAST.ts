import gql from 'graphql-tag'

export const UPDATE_WEATHERFORECAST = gql`
    mutation UpdateWeatherForecast($input: UpdateWeatherForecastInput!) {
        updateWeatherForecast(input: $input) {
            id
        }
    }
`
