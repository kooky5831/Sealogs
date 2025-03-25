import gql from 'graphql-tag'

export const CREATE_TRIPREPORT_LOGBOOKENTRYSECTION = gql`
    mutation CreateTripReport_LogBookEntrySection(
        $input: CreateTripReport_LogBookEntrySectionInput!
    ) {
        createTripReport_LogBookEntrySection(input: $input) {
            id
        }
    }
`