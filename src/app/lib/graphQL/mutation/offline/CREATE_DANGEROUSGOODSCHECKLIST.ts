import gql from 'graphql-tag'

export const CREATE_DANGEROUSGOODSCHECKLIST = gql`
    mutation CreateDangerousGoodsChecklist(
        $input: CreateDangerousGoodsChecklistInput!
    ) {
        createDangerousGoodsChecklist(input: $input) {
            id
        }
    }
`
