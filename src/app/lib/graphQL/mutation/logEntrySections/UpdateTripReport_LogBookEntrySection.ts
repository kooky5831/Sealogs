import gql from 'graphql-tag'

export const UpdateTripReport_LogBookEntrySection = gql`
    mutation UpdateTripReport_LogBookEntrySection(
        $input: UpdateTripReport_LogBookEntrySectionInput!
    ) {
        updateTripReport_LogBookEntrySection(input: $input) {
            id
        }
    }
`
