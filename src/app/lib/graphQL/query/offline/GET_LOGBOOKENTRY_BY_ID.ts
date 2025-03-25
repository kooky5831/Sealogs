import gql from 'graphql-tag'

export const GET_LOGBOOKENTRY_BY_ID = gql`
    query GetlogbookEntryById($id: ID!) {
        readOneLogBookEntry(filter: { id: { eq: $id } }) {
            id
        }
    }
`
