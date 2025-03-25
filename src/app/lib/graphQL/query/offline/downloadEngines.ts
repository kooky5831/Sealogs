import gql from 'graphql-tag'

export const DownloadEngines = gql`
    query DownloadEngines($limit: Int = 100, $offset: Int = 0) {
        readEngines(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                title
                type
                currentHours
                identifier
                isPrimary
                maxPower
                driveType
                positionOnVessel
                archived
                componentCategory
                make
                model
                kW
                kVA
                engineStartStops(sort: { created: DESC }) {
                    nodes {
                        id
                        hoursStart
                        hoursEnd
                        totalHours
                        timeStart
                        timeEnd
                        logBookEntrySection {
                            logBookEntryID
                        }
                    }
                }
            }
        }
    }
`
