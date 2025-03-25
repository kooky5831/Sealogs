import gql from 'graphql-tag'

export const CreateEngine_Usage = gql`
    mutation CreateEngine_Usage($input: CreateEngine_UsageInput!) {
        createEngine_Usage(input: $input) {
            id
        }
    }
`
