import gql from 'graphql-tag'

export const UpdateSupernumerary_LogBookEntrySection = gql`
    mutation UpdateSupernumerary_LogBookEntrySection(
        $input: UpdateSupernumerary_LogBookEntrySectionInput!
    ) {
        updateSupernumerary_LogBookEntrySection(input: $input) {
            id
        }
    }
`
