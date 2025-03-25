import gql from 'graphql-tag'

export const GET_SUPERNUMERARY_LOGBOOKENTRYSECTION_BY_ID = gql`
    query getSupernumeraryLogbookEntrySectionById($id: ID!) {
        readOneSupernumerary_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
