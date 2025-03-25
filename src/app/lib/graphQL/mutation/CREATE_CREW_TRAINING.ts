import gql from 'graphql-tag'

export const CREATE_CREW_TRAINING = gql`
    mutation CreateCrewTraining_LogBookEntrySection(
        $input: CreateCrewTraining_LogBookEntrySectionInput!
    ) {
        createCrewTraining_LogBookEntrySection(input: $input) {
            id
        }
    }
`
