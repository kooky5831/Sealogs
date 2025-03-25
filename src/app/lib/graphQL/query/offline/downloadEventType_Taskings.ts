import gql from 'graphql-tag'

export const DownloadEventType_Taskings = gql`
    query DownloadEventType_Taskings($limit: Int = 100, $offset: Int = 0) {
        readEventType_Taskings(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                time
                title
                lat
                long
                fuelLevel
                type
                operationType
                currentEntryID
                comments
                groupID
                status
                pausedTaskID
                openTaskID
                completedTaskID
                cgop
                sarop
                tripEventID
                geoLocationID
                vesselRescueID
                personRescueID
                towingChecklistID
                parentTaskingID
            }
        }
    }
`
