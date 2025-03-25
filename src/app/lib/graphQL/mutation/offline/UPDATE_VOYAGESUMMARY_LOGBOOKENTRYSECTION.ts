import gql from 'graphql-tag'

export const UPDATE_VOYAGESUMMARY_LOGBOOKENTRYSECTION = gql`
    mutation UpdateVoyageSummary_LogBookEntrySection(
        $input: UpdateVoyageSummary_LogBookEntrySectionInput!
    ) {
        updateVoyageSummary_LogBookEntrySection(input: $input) {
            id
        }
    }
`