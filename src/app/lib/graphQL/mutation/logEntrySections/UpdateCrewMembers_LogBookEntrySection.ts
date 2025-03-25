import gql from 'graphql-tag'

export const UpdateCrewMembers_LogBookEntrySection = gql`
    mutation UpdateCrewMembers_LogBookEntrySection(
        $input: UpdateCrewMembers_LogBookEntrySectionInput!
    ) {
        updateCrewMembers_LogBookEntrySection(input: $input) {
            id
        }
    }
`
