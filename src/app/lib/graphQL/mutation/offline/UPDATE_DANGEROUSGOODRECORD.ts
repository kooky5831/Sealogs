import gql from 'graphql-tag'

export const UPDATE_DANGEROUSGOODRECORD = gql`
    mutation UpdateDangerousGoodsRecord(
        $input: UpdateDangerousGoodsRecordInput!
    ) {
        updateDangerousGoodsRecord(input: $input) {
            id
        }
    }
`
