import gql from 'graphql-tag'

export const UpdateFuel_LogBookEntrySection = gql`
    mutation UpdateFuel_LogBookEntrySection(
        $input: UpdateFuel_LogBookEntrySectionInput!
    ) {
        updateFuel_LogBookEntrySection(input: $input) {
            id
        }
    }
`
