import gql from 'graphql-tag'

export const UPDATE_MITIGATIONSTRATEGY = gql`
    mutation UpdateMitigationStrategy($input: UpdateMitigationStrategyInput!) {
        updateMitigationStrategy(input: $input) {
            id
        }
    }
`
