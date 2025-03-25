import gql from 'graphql-tag'

export const CreateCrewWelfare_LogBookEntrySection = gql`
    mutation CreateCrewWelfare_LogBookEntrySection(
        $input: CreateCrewWelfare_LogBookEntrySectionInput!
    ) {
        createCrewWelfare_LogBookEntrySection(input: $input) {
            id
        }
    }
`
