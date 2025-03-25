import gql from 'graphql-tag'

export const DownloadWeatherForecasts = gql`
    query DownloadWeatherForecasts($limit: Int = 100, $offset: Int = 0) {
        readWeatherForecasts(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
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
            }
        }
    }
`
