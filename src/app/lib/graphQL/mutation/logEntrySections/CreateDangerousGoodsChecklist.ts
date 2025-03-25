import gql from 'graphql-tag'

export const CreateDangerousGoodsChecklist = gql`
    mutation CreateDangerousGoodsChecklist(
        $input: CreateDangerousGoodsChecklistInput!
    ) {
        createDangerousGoodsChecklist(input: $input) {
            id
        }
    }
`
