import gql from 'graphql-tag'

export const GET_VESSELDAILYCHECK_LOGBOOKENTRYSECTION_BY_ID = gql`
    query GetVesselDailyCheckLogbookEntrySectionById($id: ID!) {
        readOneVesselDailyCheck_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
