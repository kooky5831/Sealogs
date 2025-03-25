import gql from 'graphql-tag'

export const GET_CGEVENTMISSION_BY_ID = gql`
    query GetCGEventMission($id: ID!) {
        readOneCGEventMission(filter: { id: { eq: $id } }) {
            id
        }
    }
`
