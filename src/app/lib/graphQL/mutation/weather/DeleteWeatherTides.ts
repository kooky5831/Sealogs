import gql from 'graphql-tag'

export const DeleteWeatherTides = gql`
    mutation DeleteWeatherTides($ids: [ID]!) {
        deleteWeatherTides(ids: $ids)
    }
`
