import gql from 'graphql-tag'

export const UpdatePorts_LogBookEntrySection = gql`
    mutation UpdatePorts_LogBookEntrySection(
        $input: UpdatePorts_LogBookEntrySectionInput!
    ) {
        updatePorts_LogBookEntrySection(input: $input) {
            id
        }
    }
`
