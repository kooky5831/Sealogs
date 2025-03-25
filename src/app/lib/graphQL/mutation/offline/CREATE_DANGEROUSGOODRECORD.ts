import gql from 'graphql-tag'

export const CREATE_DANGEROUSGOODRECORD = gql`
    mutation CreateDangerousGoodsRecord(
        $input: CreateDangerousGoodsRecordInput!
    ) {
        createDangerousGoodsRecord(input: $input) {
            id
        }
    }
`