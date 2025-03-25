import gql from 'graphql-tag'

export const GetOneDangerousGoodsRecord = gql`
    query GetOneDangerousGoodsRecord($id: ID!) {
        readOneDangerousGoodsRecord(filter: { id: { eq: $id } }) {
            id
            comment
            type
        }
    }
`
