import gql from 'graphql-tag'

export const Engineer_LogBookEntrySection = gql`
    query GetEngineer_LogBookEntrySections($id: [ID]!) {
        readEngineer_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
            }
        }
    }
`
