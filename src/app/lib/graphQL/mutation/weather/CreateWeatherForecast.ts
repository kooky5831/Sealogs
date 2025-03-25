import gql from 'graphql-tag'

export const CreateWeatherForecast = gql`
    mutation CreateWeatherForecast($input: CreateWeatherForecastInput!) {
        createWeatherForecast(input: $input) {
            id
        }
    }
`
