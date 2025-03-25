import gql from 'graphql-tag'

export const GET_TOWINGCHECKLIST_BY_ID = gql`
    query GetTowingCheckListById($id: ID!) {
        readOneTowingChecklist(filter: { id: { eq: $id } }) {
            id
        }
    }
`
