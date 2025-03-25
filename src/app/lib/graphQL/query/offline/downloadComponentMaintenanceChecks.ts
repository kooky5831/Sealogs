import gql from 'graphql-tag'

export const DownloadComponentMaintenanceChecks = gql`
    query DownloadComponentMaintenanceChecks(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readComponentMaintenanceChecks(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                workOrderNumber
                groupItemTo
                projected
                actual
                difference
                name
                startDate
                documents {
                    nodes {
                        id
                    }
                }
                maintenanceCategory {
                    id
                    name
                    abbreviation
                }
                completedBy {
                    id
                    firstName
                    surname
                }
                dateCompleted
                completed
                expires
                dutyHoursAtCheck
                equipmentUsagesAtCheck
                comments
                severity
                status
                archived
                assignees {
                    nodes {
                        id
                    }
                }
                basicComponentID
                assignedToID
                assignedByID
                inventoryID
                maintenanceScheduleID
                maintenanceCheck_Signature {
                    id
                    signatureData
                }
                clientID
            }
        }
    }
`
