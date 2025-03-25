import gql from 'graphql-tag'

export const CRATE_CONSEQUENCE = gql`
    mutation CreateConsequence(
        $input: CreateConsequenceInput!
    ) {
        createConsequence(input: $input) {
            id
        }
    }
`
