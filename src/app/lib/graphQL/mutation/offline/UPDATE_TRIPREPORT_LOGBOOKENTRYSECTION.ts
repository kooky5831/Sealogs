import gql from 'graphql-tag'

export const UPDATE_TRIPREPORT_LOGBOOKENTRYSECTION = gql`
    mutation UpdateTripReport_LogBookEntrySection(
        $input: UpdateTripReport_LogBookEntrySectionInput!
    ) {
        updateTripReport_LogBookEntrySection(input: $input) {
            id
        }
    }
`