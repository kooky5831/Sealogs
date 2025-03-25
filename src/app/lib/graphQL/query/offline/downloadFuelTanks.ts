import gql from 'graphql-tag'

export const DownloadFuelTanks = gql`
    query DownloadFuelTanks($limit: Int = 100, $offset: Int = 0) {
        readFuelTanks(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                title
                identifier
                archived
                componentCategory
                capacity
                safeFuelCapacity
                currentLevel
                lastEdited
                fuelType
                dipType
                dipConversions
                dipImportID
                dipImportRun
            }
        }
    }
`
