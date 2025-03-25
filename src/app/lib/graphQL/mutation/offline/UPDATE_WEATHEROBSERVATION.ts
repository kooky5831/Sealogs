import gql from 'graphql-tag'

export const UPDATE_WEATHEROBSERVATION = gql`
    mutation UpdateWeatherObservation($input: UpdateWeatherObservationInput!) {
        updateWeatherObservation(input: $input) {
            id
        }
    }
`