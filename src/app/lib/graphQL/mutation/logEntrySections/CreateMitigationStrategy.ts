import gql from 'graphql-tag'

export const CreateMitigationStrategy = gql`
    mutation CreateMitigationStrategy($input: CreateMitigationStrategyInput!) {
        createMitigationStrategy(input: $input) {
            id
        }
    }
`
