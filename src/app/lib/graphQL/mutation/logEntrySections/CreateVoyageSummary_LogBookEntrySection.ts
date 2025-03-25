import gql from 'graphql-tag'

export const CreateVoyageSummary_LogBookEntrySection = gql`
    mutation CreateVoyageSummary_LogBookEntrySection(
        $input: CreateVoyageSummary_LogBookEntrySectionInput!
    ) {
        createVoyageSummary_LogBookEntrySection(input: $input) {
            id
        }
    }
`
