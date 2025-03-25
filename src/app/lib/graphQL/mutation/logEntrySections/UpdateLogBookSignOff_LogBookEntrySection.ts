import gql from 'graphql-tag'

export const UpdateLogBookSignOff_LogBookEntrySection = gql`
    mutation UpdateLogBookSignOff_LogBookEntrySection(
        $input: UpdateLogBookSignOff_LogBookEntrySectionInput!
    ) {
        updateLogBookSignOff_LogBookEntrySection(input: $input) {
            id
        }
    }
`
