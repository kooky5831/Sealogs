import gql from 'graphql-tag'

export const CreateRiskFactor = gql`
    mutation CreateRiskFactor($input: CreateRiskFactorInput!) {
        createRiskFactor(input: $input) {
            id
        }
    }
`
