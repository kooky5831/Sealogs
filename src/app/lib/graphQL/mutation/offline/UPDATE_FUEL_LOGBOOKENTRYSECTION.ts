import gql from 'graphql-tag'

export const UPDATE_FUEL_LOGBOOKENTRYSECTION = gql`
    mutation UpdateFuel_LogBookEntrySection(
        $input: UpdateFuel_LogBookEntrySectionInput!
    ) {
        updateFuel_LogBookEntrySection(input: $input) {
            id
        }
    }
`