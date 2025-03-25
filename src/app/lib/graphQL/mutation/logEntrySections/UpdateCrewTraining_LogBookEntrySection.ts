import gql from 'graphql-tag'

export const UPDATE_CREWTRAINING_LOOGBOOKENTRYSECTION = gql`
    mutation updateCrewTraining_LogBookEntrySection(
        $input: UpdateCrewTraining_LogBookEntrySectionInput!
    ) {
        updateCrewTraining_LogBookEntrySection(input: $input) {
            id
        }
    }
`
