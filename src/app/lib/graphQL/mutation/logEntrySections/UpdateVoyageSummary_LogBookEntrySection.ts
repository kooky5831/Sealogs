import gql from 'graphql-tag'

export const UpdateVoyageSummary_LogBookEntrySection = gql`
    mutation UpdateVoyageSummary_LogBookEntrySection(
        $input: UpdateVoyageSummary_LogBookEntrySectionInput!
    ) {
        updateVoyageSummary_LogBookEntrySection(input: $input) {
            id
        }
    }
`
