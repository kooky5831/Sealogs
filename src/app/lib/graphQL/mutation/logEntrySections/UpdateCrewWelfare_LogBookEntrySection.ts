import gql from 'graphql-tag'

export const UpdateCrewWelfare_LogBookEntrySection = gql`
    mutation UpdateCrewWelfare_LogBookEntrySection(
        $input: UpdateCrewWelfare_LogBookEntrySectionInput!
    ) {
        updateCrewWelfare_LogBookEntrySection(input: $input) {
            id
        }
    }
`
