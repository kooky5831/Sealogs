import gql from 'graphql-tag'

export const GET_DANGEROUSGOODSCHECKLIST_BY_ID = gql`
    query GetDangerousGoodsChecklistById($id: ID!) {
        readOneEventType_PersonRescue(filter: { id: { eq: $id } }) {
            id
        }
    }
`
