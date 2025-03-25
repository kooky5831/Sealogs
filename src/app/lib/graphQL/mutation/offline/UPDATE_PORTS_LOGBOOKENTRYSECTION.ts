import gql from 'graphql-tag'

export const UPDATE_PORTS_LOGBOOKENTRYSECTION = gql`
    mutation UpdatePorts_LogBookEntrySection(
        $input: UpdatePorts_LogBookEntrySectionInput!
    ) {
        updatePorts_LogBookEntrySection(input: $input) {
            id
        }
    }
`
