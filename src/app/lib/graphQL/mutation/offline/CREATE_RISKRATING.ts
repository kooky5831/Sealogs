import gql from 'graphql-tag'

export const CREATE_RISKRATING = gql`
    mutation CreateRiskRating(
        $input: CreateRiskRatingInput!
    ) {
        createRiskRating(input: $input) {
            id
        }
    }
`