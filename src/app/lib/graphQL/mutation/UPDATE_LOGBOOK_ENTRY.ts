import gql from 'graphql-tag'

export const UPDATE_LOGBOOK_ENTRY = gql`
    mutation UpdateLogBookEntry($input: UpdateLogBookEntryInput!) {
        updateLogBookEntry(input: $input) {
            id
        }
    }
`
