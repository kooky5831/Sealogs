import gql from 'graphql-tag'

export const CREATE_WEATHEROBSERVATION = gql`
    mutation CreateWeatherObservation($input: CreateWeatherObservationInput!) {
        createWeatherObservation(input: $input) {
            id
        }
    }
`
