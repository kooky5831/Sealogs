
import gql from 'graphql-tag'

export const CREATE_MITIGATIONSTRATEGY = gql`
    mutation CreateMitigationStrategy($input: CreateMitigationStrategyInput!) {
        createMitigationStrategy(input: $input) {
            id
        }
    }
`
