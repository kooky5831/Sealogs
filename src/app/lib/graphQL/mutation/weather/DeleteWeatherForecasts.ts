import gql from 'graphql-tag'

export const DeleteWeatherForecasts = gql`
    mutation DeleteWeatherForecasts($ids: [ID]!) {
        deleteWeatherForecasts(ids: $ids)
    }
`
