import gql from 'graphql-tag'

export const GET_WEATHEROBSERVATION = gql`
    query ReadOneWeatherObservation($id: ID!) {
        readOneWeatherObservation(filter: { id: { eq: $id } }) {
            id
        }
    }
`
