import gql from 'graphql-tag'

export const GET_LIKELIHOOD_BY_ID = gql`
    query GetLikelihoodById($id: ID!) {
        readOneLikelihood(filter: { id: { eq: $id } }) {
            id
        }
    }
`
