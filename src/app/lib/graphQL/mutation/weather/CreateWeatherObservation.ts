import gql from 'graphql-tag'

export const CreateWeatherObservation = gql`
    mutation CreateWeatherObservation($input: CreateWeatherObservationInput!) {
        createWeatherObservation(input: $input) {
            id
        }
    }
`
