
import gql from 'graphql-tag'

export const CREATE_LIKELIHOOD = gql`
    mutation CreateLikelihood($input: CreateLikelihoodInput!) {
        createLikelihood(input: $input) {
            id
        }
    }
`
