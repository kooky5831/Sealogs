import gql from 'graphql-tag'

export const GET_RESKFACTOR_BY_ID = gql`
    query GetRiskFactorById($id: ID!) {
        readOneRiskFactor(filter: { id: { eq: $id } }) {
            id
        }
    }
`
