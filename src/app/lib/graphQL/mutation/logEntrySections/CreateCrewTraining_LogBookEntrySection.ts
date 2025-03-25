import gql from 'graphql-tag'

export const CreateCrewTraining_LogBookEntrySection = gql`
    mutation CreateCrewTraining_LogBookEntrySection(
        $input: CreateCrewTraining_LogBookEntrySectionInput!
    ) {
        createCrewTraining_LogBookEntrySection(input: $input) {
            id
        }
    }
`
