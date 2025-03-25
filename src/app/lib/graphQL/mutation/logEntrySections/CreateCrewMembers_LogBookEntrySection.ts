import gql from 'graphql-tag'

export const CreateCrewMembers_LogBookEntrySection = gql`
    mutation CreateCrewMembers_LogBookEntrySection(
        $input: CreateCrewMembers_LogBookEntrySectionInput!
    ) {
        createCrewMembers_LogBookEntrySection(input: $input) {
            id
        }
    }
`
