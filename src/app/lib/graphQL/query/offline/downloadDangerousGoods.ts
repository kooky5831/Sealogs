import gql from 'graphql-tag'

export const DownloadDangerousGoods = gql`
    query DownloadDangerousGoods($limit: Int = 100, $offset: Int = 0) {
        readDangerousGoods(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                title
            }
        }
    }
`
