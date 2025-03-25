import gql from 'graphql-tag'

export const UPDATE_DANGEROUSGOODCHECKLIST = gql`
    mutation UpdateDangerousGoodsChecklist(
        $input: UpdateDangerousGoodsChecklistInput!
    ) {
        updateDangerousGoodsChecklist(input: $input) {
            id
        }
    }
`
