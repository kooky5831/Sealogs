import gql from 'graphql-tag'

export const DownloadEventType_RestrictedVisibilities = gql`
    query DownloadEventType_RestrictedVisibilities(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readEventType_RestrictedVisibilities(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                crossingTime
                estSafeSpeed
                stopAssessPlan
                crewBriefing
                navLights
                soundSignals
                lookout
                soundSignal
                radarWatch
                radioWatch
                crossedTime
                approxSafeSpeed
                report
                startLat
                startLong
                endLat
                endLong
                tripEventID
                startLocationID
                endLocationID
            }
        }
    }
`
