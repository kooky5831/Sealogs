import gql from 'graphql-tag'

export const CREATE_VOYAGESUMMARY_LOGBOOKENTRYSECTOIN = gql`
    mutation CreateVoyageSummary_LogBookEntrySection(
        $input: CreateVoyageSummary_LogBookEntrySectionInput!
    ) {
        createVoyageSummary_LogBookEntrySection(input: $input) {
            id
        }
    }
`