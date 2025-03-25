import gql from 'graphql-tag'

export const UPDATE_RISKRATING = gql`
    mutation UpdateRiskRating(
        $input: UpdateRiskRatingInput!
    ) {
        updateRiskRating(input: $input) {
            id
        }
    }
`