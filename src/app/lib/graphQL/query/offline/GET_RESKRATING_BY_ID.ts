import gql from 'graphql-tag'

export const GET_RESKRATING_BY_ID = gql`
    query Get_RiskRating($id: ID!) {
        readOneRiskRating(filter: { id: { eq: $id } }) {
            id
        }
    }
`