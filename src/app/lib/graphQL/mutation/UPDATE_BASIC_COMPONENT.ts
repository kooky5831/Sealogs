import gql from 'graphql-tag'

export const UPDATE_BASIC_COMPONENT = gql`
    mutation UpdateBasicComponent($input: UpdateBasicComponentInput!) {
        updateBasicComponent(input: $input) {
            id
            documents {
                nodes {
                    id
                    fileFilename
                    name
                    title
                }
            }
        }
    }
`
