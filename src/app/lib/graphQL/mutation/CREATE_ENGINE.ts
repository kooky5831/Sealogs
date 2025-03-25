import gql from 'graphql-tag'

export const CREATE_ENGINE = gql`
    mutation CreateEngine($input: CreateEngineInput!) {
        createEngine(input: $input) {
            id
        }
    }
`
