import gql from 'graphql-tag'

export const GET_LOGBOOKSIGNOFF_LOGBOOKENTRYSECTION_BY_ID = gql`
    query GetLogbookSignOffLogbookEntrySectionById($id: ID!) {
        readOneLogBookSignOff_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
