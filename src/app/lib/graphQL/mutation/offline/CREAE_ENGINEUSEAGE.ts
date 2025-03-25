import gql from 'graphql-tag'

export const CREAE_ENGINEUSEAGE = gql`
    mutation CreateEngine_Usage($input: CreateEngine_UsageInput!) {
        createEngine_Usage(input: $input) {
            id
        }
    }
`
