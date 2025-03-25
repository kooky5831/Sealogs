import gql from 'graphql-tag'

export const UPDATE_LIKELIHOOD = gql`
    mutation UpdateLikelihood($input: UpdateLikelihoodInput!) {
        updateLikelihood(input: $input) {
            id
        }
    }
`
