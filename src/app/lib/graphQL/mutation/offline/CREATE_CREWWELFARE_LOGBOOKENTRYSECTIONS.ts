import gql from 'graphql-tag'

export const CREATE_CREWWELFARE_LOGBOOKENTRYSECTIONS = gql`
    mutation CreateCrewWelfare_LogBookEntrySection(
        $input: CreateCrewWelfare_LogBookEntrySectionInput!
    ) {
        createCrewWelfare_LogBookEntrySection(input: $input) {
            id
        }
    }
`