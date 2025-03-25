import gql from 'graphql-tag'

export const CreateLogBookSignOff_LogBookEntrySection = gql`
    mutation CreateLogBookSignOff_LogBookEntrySection(
        $input: CreateLogBookSignOff_LogBookEntrySectionInput!
    ) {
        createLogBookSignOff_LogBookEntrySection(input: $input) {
            id
        }
    }
`
