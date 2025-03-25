import gql from 'graphql-tag'

export const ReadWeatherForecasts = gql`
    query ReadWeatherForecasts($filter: WeatherForecastFilterFields) {
        readWeatherForecasts(filter: $filter) {
            nodes {
                id
                logBookEntryID
                time
                day
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
            }
        }
    }
`
