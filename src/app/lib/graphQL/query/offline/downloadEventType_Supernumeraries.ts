import gql from 'graphql-tag'

export const DownloadEventType_Supernumeraries = gql`
    query DownloadEventType_Supernumeraries(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readEventType_Supernumeraries(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                title
                totalGuest
                focGuest
                isBriefed
                briefingTime
                guestList {
                    nodes {
                        id
                    }
                }
            }
        }
    }
`
