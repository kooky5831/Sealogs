import gql from 'graphql-tag'

export const CREATE_RISKFACTOR = gql`
    mutation CreateRiskFactor($input: CreateRiskFactorInput!) {
        createRiskFactor(input: $input) {
            id
        }
    }
`
