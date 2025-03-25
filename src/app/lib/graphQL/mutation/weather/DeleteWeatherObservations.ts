import gql from 'graphql-tag'

export const DeleteWeatherObservations = gql`
    mutation DeleteWeatherObservations($ids: [ID]!) {
        deleteWeatherObservations(ids: $ids)
    }
`
