import gql from 'graphql-tag'

export const GET_WEATHERTIDES_BY_ID = gql`
    query Get_WeatherTiedsById($id: ID!) {
        readOneWeatherTide(filter: { id: { eq: $id } }) {
            id
        }
    }
`