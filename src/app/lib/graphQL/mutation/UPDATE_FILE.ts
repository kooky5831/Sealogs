import gql from 'graphql-tag'

export const UPDATE_FILE = gql`
    mutation UpdateFile($input: UpdateFileInput!) {
        updateFile(input: $input) {
            id
            fileFilename
            name
            title
            created
        }
    }
`
