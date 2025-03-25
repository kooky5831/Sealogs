import gql from 'graphql-tag'

export const UPDATE_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION = gql`
    mutation UpdateLogBookSignOff_LogBookEntrySection(
        $input: UpdateLogBookSignOff_LogBookEntrySectionInput!
    ) {
        updateLogBookSignOff_LogBookEntrySection(input: $input) {
            id
        }
    }
`