import gql from 'graphql-tag'

export const DownloadDangerousGoodsRecords = gql`
    query DownloadDangerousGoodsRecords($limit: Int = 100, $offset: Int = 0) {
        readDangerousGoodsRecords(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                comment
                type
            }
        }
    }
`
