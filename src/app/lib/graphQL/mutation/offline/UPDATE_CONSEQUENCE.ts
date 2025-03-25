import gql from 'graphql-tag'

export const UPDATE_CONSEQUENCE = gql`
    mutation UpdateConsequence(
        $input: UpdateConsequenceInput!
    ) {
        updateConsequence(input: $input) {
            id
        }
    }
`
