import gql from 'graphql-tag'

export const CreateFuel_LogBookEntrySection = gql`
    mutation CreateFuel_LogBookEntrySection(
        $input: CreateFuel_LogBookEntrySectionInput!
    ) {
        createFuel_LogBookEntrySection(input: $input) {
            id
        }
    }
`
