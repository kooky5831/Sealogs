import gql from 'graphql-tag'

export const ReadWeatherTides = gql`
    query ReadWeatherTides($filter: WeatherTideFilterFields) {
        readWeatherTides(filter: $filter) {
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
                geoLocation {
                    id
                    title
                    lat
                    long
                }
            }
        }
    }
`
