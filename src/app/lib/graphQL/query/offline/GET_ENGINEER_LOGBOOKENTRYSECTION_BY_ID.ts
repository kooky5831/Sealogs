import gql from 'graphql-tag'

export const GET_ENGINEER_LOGBOOKENTRYSECTION_BY_ID = gql`
    query GetEngineerLogBookEntrySectionById($id: ID!) {
        readOneEngineer_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
