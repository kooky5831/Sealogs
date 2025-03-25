import gql from 'graphql-tag'

export const CREATE_SUPERNUMERARY_LOGBOOKENTRYSECTION = gql`
    mutation CreateSupernumerary_LogBookEntrySection(
        $input: CreateSupernumerary_LogBookEntrySectionInput!
    ) {
        createSupernumerary_LogBookEntrySection(input: $input) {
            id
        }
    }
`