import gql from 'graphql-tag'

export const Ports_LogBookEntrySection = gql`
    query GetPorts_LogBookEntrySections($id: [ID]!) {
        readPorts_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
            }
        }
    }
`
