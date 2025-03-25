import gql from 'graphql-tag'

export const GET_VOYAGESUMMARY_LOGBBOOKENTRYSECTION_BY_ID = gql`
    query GetVoyageSummaryLogbookEntrySectionById($id: ID!) {
        readOneVoyageSummary_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
