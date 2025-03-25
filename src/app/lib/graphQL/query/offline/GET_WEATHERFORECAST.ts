import gql from 'graphql-tag'

export const GET_WEATHERFORECAST = gql`
    query Get_WeatherForecast($id: ID!) {
        readOneWeatherForecast(filter: { id: { eq: $id } }) {
            id
        }
    }
`