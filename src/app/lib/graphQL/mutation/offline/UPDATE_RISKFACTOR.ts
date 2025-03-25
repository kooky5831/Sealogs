import gql from 'graphql-tag'

export const UPDATE_RISKFACTOR = gql`
    mutation UpdateRiskFactor($input: UpdateRiskFactorInput!) {
        updateRiskFactor(input: $input) {
            id
        }
    }
`
