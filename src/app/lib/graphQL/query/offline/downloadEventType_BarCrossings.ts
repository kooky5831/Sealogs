import gql from 'graphql-tag'

export const DownloadEventType_BarCrossings = gql`
    query DownloadEventType_BarCrossings($limit: Int = 100, $offset: Int = 0) {
        readEventType_BarCrossings(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                time
                timeCompleted
                stopAssessPlan
                crewBriefing
                weather
                stability
                waterTightness
                lifeJackets
                lookoutPosted
                report
                lat
                long
                latCompleted
                longCompleted
                tripEventID
                geoLocationID
                geoLocationCompletedID
                barCrossingChecklistID
            }
        }
    }
`
