import gql from 'graphql-tag'

export const UpdateWeatherObservation = gql`
    mutation UpdateWeatherObservation($input: UpdateWeatherObservationInput!) {
        updateWeatherObservation(input: $input) {
            id
        }
    }
`
