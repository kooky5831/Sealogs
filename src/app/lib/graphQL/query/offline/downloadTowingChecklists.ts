import gql from 'graphql-tag'

export const DownloadTowingChecklists = gql`
    query DownloadTowingChecklists($limit: Int = 100, $offset: Int = 0) {
        readTowingChecklists(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                conductSAP
                investigateNatureOfIssue
                everyoneOnBoardOk
                rudderToMidshipsAndTrimmed
                lifejacketsOn
                communicationsEstablished
                secureAndSafeTowing
                memberID
                vesselID
            }
        }
    }
`
