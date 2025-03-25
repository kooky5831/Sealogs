import gql from 'graphql-tag'

export const ReadWeatherObservations = gql`
    query ReadWeatherObservations($filter: WeatherObservationFilterFields) {
        readWeatherObservations(filter: $filter) {
            nodes {
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
                forecast {
                    id
                    time
                }
            }
        }
    }
`
