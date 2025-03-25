import gql from 'graphql-tag'

export const UPDATE_ENGINE_LOGBOOKENTRYSECTION = gql`
    mutation (
        $input: UpdateEngine_LogBookEntrySectionInput!
    ) {
        updateEngine_LogBookEntrySection(input: $input) {
            id
        }
    }
`
