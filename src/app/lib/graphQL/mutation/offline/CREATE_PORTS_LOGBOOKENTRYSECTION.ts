import gql from 'graphql-tag'

export const CREATE_PORTS_LOGBOOKENTRYSECTION = gql`
    mutation CreatePorts_LogBookEntrySection(
        $input: CreatePorts_LogBookEntrySectionInput!
    ) {
        createPorts_LogBookEntrySection(input: $input) {
            id
        }
    }
`
