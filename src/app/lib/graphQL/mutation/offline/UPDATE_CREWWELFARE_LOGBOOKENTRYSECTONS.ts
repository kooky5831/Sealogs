import gql from 'graphql-tag'

export const UPDATE_CREWWELFARE_LOGBOOKENTRYSECTONS = gql`
    mutation UpdateCrewWelfare_LogBookEntrySection(
        $input: UpdateCrewWelfare_LogBookEntrySectionInput!
    ) {
        updateCrewWelfare_LogBookEntrySection(input: $input) {
            id
        }
    }
`
