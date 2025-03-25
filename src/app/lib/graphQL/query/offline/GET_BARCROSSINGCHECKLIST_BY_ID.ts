import gql from 'graphql-tag'

export const GET_BARCROSSINGCHECKLIST_BY_ID = gql`
    query GetBarCrossingChecklistById($id: ID!) {
        readOneBarCrossingChecklist(filter: { id: { eq: $id } }) {
            id
        }
    }
`
