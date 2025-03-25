import gql from 'graphql-tag'

export const GET_CONSEQUENCE_BY_ID = gql`
    query GetConseqenceById($id: ID!) {
        readOneConsequence(filter: { id: { eq: $id } }) {
            id
        }
    }
`
