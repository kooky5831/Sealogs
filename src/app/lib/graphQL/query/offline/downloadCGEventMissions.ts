import gql from 'graphql-tag'

export const DownloadCGEventMissions = gql`
    query DownloadCGEventMissions($limit: Int = 100, $offset: Int = 0) {
        readCGEventMissions(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                missionType
                description
                operationOutcome
                completedAt
                eventID
                eventType
                operationDescription
                lat
                long
                currentLocationID
                vesselRescueID
                personRescueID
                vesselPositionID
                vesselID
            }
        }
    }
`
