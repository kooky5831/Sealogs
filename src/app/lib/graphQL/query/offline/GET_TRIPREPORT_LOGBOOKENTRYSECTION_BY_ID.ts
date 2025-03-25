import gql from 'graphql-tag'

export const GET_TRIPREPORT_LOGBOOKENTRYSECTION_BY_ID = gql`
    query GetTripReportLogbookEntryId($id: ID!) {
        readOneTripReport_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
