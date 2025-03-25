import gql from 'graphql-tag'

export const DownloadMaintenanceChecks = gql`
    query DownloadMaintenanceChecks($limit: Int = 100, $offset: Int = 0) {
        readMaintenanceChecks(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                name
                startDate
                completed
                expires
                dutyHoursAtCheck
                equipmentUsagesAtCheck
                comments
                severity
                status
                maintenanceScheduleID
                maintenanceCheck_SignatureID
            }
        }
    }
`
