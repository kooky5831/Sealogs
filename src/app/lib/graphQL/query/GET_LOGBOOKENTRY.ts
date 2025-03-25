import gql from 'graphql-tag'

export const GET_LOGBOOKENTRY = gql`
    query GetLogBookEntriesCombinedQuery($vesselId: ID!) {
        readCrewMembers_LogBookEntrySections {
            nodes {
                id
                logBookEntryID
                crewMember {
                    firstName
                    surname
                }
            }
        }
        GetLogBookEntries: readLogBookEntries(
            filter: { vehicleID: { eq: $vesselId } }
        ) {
            nodes {
                id
                archived
                masterID
                startDate
                endDate
                logBookID
                fuelLevel
                logBookID
                createdByID
                signOffCommentID
                signOffSignatureID
                clientID
                master {
                    id
                    firstName
                    surname
                }
                signOffComment {
                    id
                    detail
                    comment
                    fieldName
                    commentType
                }
                state
                vehicle {
                    id
                    title
                    seaLogsMembers {
                        nodes {
                            id
                        }
                    }
                }
                logBookEntryLoggers {
                    edges {
                        node {
                            id
                        }
                    }
                    nodes {
                        id
                    }
                    pageInfo {
                        totalCount
                    }
                }
                logBookEntrySections {
                    nodes {
                        id
                        className
                    }
                }
            }
        }
    }
`
