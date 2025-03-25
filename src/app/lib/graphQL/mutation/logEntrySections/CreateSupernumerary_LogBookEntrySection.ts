import gql from 'graphql-tag'

export const CreateSupernumerary_LogBookEntrySection = gql`
    mutation CreateSupernumerary_LogBookEntrySection(
        $input: CreateSupernumerary_LogBookEntrySectionInput!
    ) {
        createSupernumerary_LogBookEntrySection(input: $input) {
            id
        }
    }
`
