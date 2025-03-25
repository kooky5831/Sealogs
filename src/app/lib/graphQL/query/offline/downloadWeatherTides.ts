import gql from 'graphql-tag'

export const DownloadWeatherTides = gql`
    query DownloadWeatherTides($limit: Int = 100, $offset: Int = 0) {
        readWeatherTides(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                tideDate
                firstHighTideTime
                firstHighTideHeight
                firstLowTideTime
                firstLowTideHeight
                secondHighTideTime
                secondHighTideHeight
                secondLowTideTime
                secondLowTideHeight
                tidalStation
                tidalStationDistance
                lat
                long
                comment
                logBookEntryID
                geoLocationID
            }
        }
    }
`
