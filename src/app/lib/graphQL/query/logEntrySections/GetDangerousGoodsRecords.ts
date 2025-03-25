import gql from 'graphql-tag'

export const GetDangerousGoodsRecords = gql`
    query GetDangerousGoodsRecords($ids: [ID]!) {
        readDangerousGoodsRecords(filter: { id: { in: $ids } }) {
            nodes {
                id
                comment
                type
            }
        }
    }
`
