import gql from 'graphql-tag'

export const UpdateMitigationStrategy = gql`
    mutation UpdateMitigationStrategy($input: UpdateMitigationStrategyInput!) {
        updateMitigationStrategy(input: $input) {
            id
        }
    }
`
