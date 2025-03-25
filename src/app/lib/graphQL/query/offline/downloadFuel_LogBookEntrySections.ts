import gql from 'graphql-tag'

export const DownloadFuel_LogBookEntrySections = gql`
    query DownloadFuel_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readFuel_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                fuelTankStartStops {
                    nodes {
                        id
                        start
                        end
                        fuelType
                        comments
                        fuelTankID
                    }
                }
            }
        }
    }
`
