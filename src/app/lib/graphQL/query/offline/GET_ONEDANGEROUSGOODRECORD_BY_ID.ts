import gql from 'graphql-tag'

export const GET_ONEDANGEROUSGOODRECORD_BY_ID = gql`
    query GetOneDangerousGoodsRecordById($id: ID!) {
        readOneDangerousGoodsRecord(filter: { id: { eq: $id } }) {
            id
            comment
            type
        }
    }
`