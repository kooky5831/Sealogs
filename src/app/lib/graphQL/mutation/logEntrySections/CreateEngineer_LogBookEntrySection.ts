import gql from 'graphql-tag'

export const CREATE_ENGINEER_LOGBOOKENTRYSECTION = gql`
    mutation CreateEngineer_LogBookEntrySection(
        $input: CreateEngineer_LogBookEntrySectionInput!
    ) {
        createEngineer_LogBookEntrySection(input: $input) {
            id
        }
    }
`
