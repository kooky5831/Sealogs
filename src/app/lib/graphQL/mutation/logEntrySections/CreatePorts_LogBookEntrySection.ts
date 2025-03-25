import gql from 'graphql-tag'

export const CreatePorts_LogBookEntrySection = gql`
    mutation CreatePorts_LogBookEntrySection(
        $input: CreatePorts_LogBookEntrySectionInput!
    ) {
        createPorts_LogBookEntrySection(input: $input) {
            id
        }
    }
`
