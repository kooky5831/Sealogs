import gql from 'graphql-tag'

export const DownloadComponentMaintenanceSchedules = gql`
    query DownloadComponentMaintenanceSchedules(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readComponentMaintenanceSchedules(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                title
                description
                type
                occursEveryType
                occursEvery
                proRata
                warnWithinType
                highWarnWithin
                mediumWarnWithin
                lowWarnWithin
                groupTo
                inventoryID
                componentCategories
                maintenanceChecks {
                    nodes {
                        id
                    }
                }
                engineUsage {
                    nodes {
                        id
                        lastScheduleHours
                        isScheduled
                        engine {
                            id
                            title
                            currentHours
                        }
                    }
                }
                basicComponents {
                    nodes {
                        id
                        title
                        componentCategory
                    }
                }
            }
        }
    }
`
