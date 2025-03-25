import gql from 'graphql-tag'

export const CreateTripReport_LogBookEntrySection = gql`
    mutation CreateTripReport_LogBookEntrySection(
        $input: CreateTripReport_LogBookEntrySectionInput!
    ) {
        createTripReport_LogBookEntrySection(input: $input) {
            id
        }
    }
`
