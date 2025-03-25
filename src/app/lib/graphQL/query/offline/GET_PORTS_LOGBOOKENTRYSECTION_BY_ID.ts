import gql from 'graphql-tag'

export const GET_PORTS_LOGBOOKENTRYSECTION_BY_ID = gql`
    query getPortsLogbookEntrySectionById($id: ID!) {
        readOnePorts_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
