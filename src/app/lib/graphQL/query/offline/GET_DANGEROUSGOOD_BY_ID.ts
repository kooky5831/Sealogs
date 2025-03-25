import gql from 'graphql-tag'

export const GET_DANGEROUSGOOD_BY_ID = gql`
    query GetDangerousGoodById($id: ID!) {
        readOneDangerousGood(filter: { id: { eq: $id } }) {
            id
        }
    }
`
