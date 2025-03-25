import gql from 'graphql-tag'

export const DownloadMaintenanceSchedules = gql`
    query DownloadMaintenanceSchedules($limit: Int = 100, $offset: Int = 0) {
        readMaintenanceSchedules(limit: $limit, offset: $offset) {
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
                attachments {
                    nodes {
                        id
                    }
                }
            }
        }
    }
`
