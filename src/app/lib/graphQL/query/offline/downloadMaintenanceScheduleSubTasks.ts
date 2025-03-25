import gql from 'graphql-tag'

export const DownloadMaintenanceScheduleSubTasks = gql`
    query DownloadMaintenanceScheduleSubTasks(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readMaintenanceScheduleSubTasks(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                task
                description
                componentMaintenanceScheduleID
                inventoryID
            }
        }
    }
`
