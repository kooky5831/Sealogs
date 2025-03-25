import gql from 'graphql-tag'

export const DownloadEventType_PassengerDropFacilities = gql`
    query DownloadEventType_PassengerDropFacilities(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readEventType_PassengerDropFacilities(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                time
                title
                fuelLevel
                paxOn
                paxOff
                lat
                long
                type
                tripEventID
                geoLocationID
            }
        }
    }
`
