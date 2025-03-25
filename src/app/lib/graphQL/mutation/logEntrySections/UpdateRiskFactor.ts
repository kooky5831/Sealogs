import gql from 'graphql-tag'

export const UpdateRiskFactor = gql`
    mutation UpdateRiskFactor($input: UpdateRiskFactorInput!) {
        updateRiskFactor(input: $input) {
            id
        }
    }
`
