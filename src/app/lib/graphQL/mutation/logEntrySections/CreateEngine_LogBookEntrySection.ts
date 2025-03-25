import gql from 'graphql-tag'

export const CREATE_ENGINE_LOOGBOOKENTRYSECTION = gql`
    mutation CreateEngine_LogBookEntrySection(
        $input: CreateEngine_LogBookEntrySectionInput!
    ) {
        createEngine_LogBookEntrySection(input: $input) {
            id
        }
    }
`
