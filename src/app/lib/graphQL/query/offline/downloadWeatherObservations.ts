import gql from 'graphql-tag'

export const DownloadWeatherObservations = gql`
    query DownloadWeatherObservations($limit: Int = 100, $offset: Int = 0) {
        readWeatherObservations(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
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
                forecastID
            }
        }
    }
`
