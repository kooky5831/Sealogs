import gql from 'graphql-tag'

export const GET_FILES = gql`
    query GetFiles($id: [ID]!) {
        readFiles(filter: { id: { in: $id } }) {
            nodes {
                id
                title
                name
                fileFilename
                created
            }
        }
    }
`
