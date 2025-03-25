import gql from 'graphql-tag'

export const UpdateEngine_Usage = gql`
    mutation UpdateEngine_Usage($input: UpdateEngine_UsageInput!) {
        updateEngine_Usage(input: $input) {
            id
        }
    }
`
