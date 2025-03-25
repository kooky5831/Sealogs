import gql from 'graphql-tag'

export const GET_ALL_LOGBOOK_ENTRIES = gql`
    query {
        readLogBookEntries {
            nodes {
                id
                archived
                masterID
                startDate
                endDate
                fuelLevel
                logBookID
                createdByID
                signOffCommentID
                signOffSignatureID
                clientID
            }
        }
    }
`
