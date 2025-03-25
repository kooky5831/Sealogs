import gql from 'graphql-tag'

export const ReadOneWeatherObservation = gql`
    query ReadOneWeatherObservation($id: ID!) {
        readOneWeatherObservation(filter: { id: { eq: $id } }) {
            id
            logBookEntryID
            time
            lat
            long
            windSpeed
            windDirection
            swell
            visibility
            precipitation
            pressure
            cloudCover
            comment
            geoLocationID
            geoLocation {
                id
                lat
                long
                title
            }
            forecastID
        }
    }
`
