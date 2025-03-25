import gql from 'graphql-tag'

export const CreateDangerousGoodsRecord = gql`
    mutation CreateDangerousGoodsRecord(
        $input: CreateDangerousGoodsRecordInput!
    ) {
        createDangerousGoodsRecord(input: $input) {
            id
        }
    }
`
