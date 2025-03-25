import gql from 'graphql-tag'

export const UPDATE_ENGINEER_LOGBOOKENTRYSECTION = gql`
    mutation UpdateEngineer_LogBookEntrySection(
        $input: UpdateEngineer_LogBookEntrySectionInput!
    ) {
        updateEngineer_LogBookEntrySection(input: $input) {
            id
        }
    }
`
