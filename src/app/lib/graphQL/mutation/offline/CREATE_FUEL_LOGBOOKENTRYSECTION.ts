import gql from 'graphql-tag'

export const CREATE_FUEL_LOGBOOKENTRYSECTION = gql`
    mutation CreateFuel_LogBookEntrySection(
        $input: CreateFuel_LogBookEntrySectionInput!
    ) {
        createFuel_LogBookEntrySection(input: $input) {
            id
        }
    }
`