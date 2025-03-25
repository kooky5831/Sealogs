import gql from 'graphql-tag'

export const LogbookEntrySection_Signature = gql`
    query GetLogbookEntrySection_Signature($id: ID!) {
        readOneLogBookEntrySection_Signature(filter: { id: { eq: $id } }) {
            id
        }
    }
`
