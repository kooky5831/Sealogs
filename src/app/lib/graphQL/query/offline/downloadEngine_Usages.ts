import gql from 'graphql-tag'

export const DownloadEngine_Usages = gql`
    query DownloadEngine_Usages($limit: Int = 100, $offset: Int = 0) {
        readEngine_Usages(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                lastScheduleHours
                isScheduled
                maintenanceScheduleID
                engineID
            }
        }
    }
`
