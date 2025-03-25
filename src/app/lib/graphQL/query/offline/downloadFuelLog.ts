import gql from 'graphql-tag'

export const DownloadFuelLog = gql`
    query DownloadFuelLog($limit: Int = 100, $offset: Int = 0) {
        readFuelLogs(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                fuelAdded
                fuelBefore
                fuelAfter
                date
                created
                refuellingBunkeringID
                eventType_TaskingID
                eventType_PassengerDropFacilityID
                logBookEntryID
                fuelTankID
                notes
            }
        }
    }
`
