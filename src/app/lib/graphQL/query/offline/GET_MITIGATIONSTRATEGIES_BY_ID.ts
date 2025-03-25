import gql from 'graphql-tag'

export const GET_MITIGATIONSTRATEGIES_BY_ID = gql`
    query GetMitigationStrategiesById($id: ID!) {
        readOneMitigationStrategy(filter: { id: { eq: $id } }) {
            id
        }
    }
`
