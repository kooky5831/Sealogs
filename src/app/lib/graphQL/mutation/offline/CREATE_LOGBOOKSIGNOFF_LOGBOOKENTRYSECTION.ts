import gql from 'graphql-tag'

export const CREATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION = gql`
    mutation CreateLogBookSignOff_LogBookEntrySection(
        $input: CreateLogBookSignOff_LogBookEntrySectionInput!
    ) {
        createLogBookSignOff_LogBookEntrySection(input: $input) {
            id
        }
    }
`