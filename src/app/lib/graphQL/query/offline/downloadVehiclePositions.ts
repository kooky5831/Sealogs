import gql from 'graphql-tag'

export const DownloadVehiclePositions = gql`
    query DownloadVehiclePositions($limit: Int = 100, $offset: Int = 0) {
        readVehiclePositions(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                time
                lat
                long
                geoLocationID
                geoLocation {
                    id
                    lat
                    long
                    title
                }
                vehicleID
                vehicle {
                    id
                }
            }
        }
    }
`
