import gql from 'graphql-tag'

export const UPDATE_ENGINE = gql`
    mutation UpdateEngine($input: UpdateEngineInput!) {
        updateEngine(input: $input) {
            id
        }
    }
`
