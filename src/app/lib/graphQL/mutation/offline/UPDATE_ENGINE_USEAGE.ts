import gql from 'graphql-tag'

export const UPDATE_ENGINE_USEAGE = gql`
    mutation UpdateEngine_Usage($input: UpdateEngine_UsageInput!) {
        updateEngine_Usage(input: $input) {
            id
        }
    }
`