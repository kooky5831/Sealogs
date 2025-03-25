import gql from 'graphql-tag'

export const CREATE_LOGBOOK_ENTRY = gql`
    mutation CreateLogBookEntry($input: CreateLogBookEntryInput!) {
        createLogBookEntry(input: $input) {
            id
        }
    }
`
