import gql from 'graphql-tag'

export const UpdateDangerousGoodsRecord = gql`
    mutation UpdateDangerousGoodsRecord(
        $input: UpdateDangerousGoodsRecordInput!
    ) {
        updateDangerousGoodsRecord(input: $input) {
            id
        }
    }
`
