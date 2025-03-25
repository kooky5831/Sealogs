import gql from 'graphql-tag'

export const DownloadMissionTimelines = gql`
    query DownloadMissionTimelines($limit: Int = 100, $offset: Int = 0) {
        readMissionTimelines(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                commentType
                description
                time
                archived
                authorID
                missionID
                vesselRescueID
                personRescueID
                maintenanceCheckID
                subTaskID
            }
        }
    }
`
