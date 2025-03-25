import gql from 'graphql-tag'

export const UPDATE_SUPERNUMERARY_LOGBOOKENTRSECTION = gql`
    mutation UpdateSupernumerary_LogBookEntrySection(
        $input: UpdateSupernumerary_LogBookEntrySectionInput!
    ) {
        updateSupernumerary_LogBookEntrySection(input: $input) {
            id
        }
    }
`