import gql from 'graphql-tag'

export const UpdateDangerousGoodsChecklist = gql`
    mutation UpdateDangerousGoodsChecklist(
        $input: UpdateDangerousGoodsChecklistInput!
    ) {
        updateDangerousGoodsChecklist(input: $input) {
            id
        }
    }
`
