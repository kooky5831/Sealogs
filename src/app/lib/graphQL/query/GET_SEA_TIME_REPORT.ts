import gql from 'graphql-tag'

export const GET_SEA_TIME_REPORT = gql`
    query getSeatimeReport($vesselIds: [ID!]!) {
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
        GetLogBookEntriesForVessels: readLogBookEntries(
            filter: { vehicleID: { in: $vesselIds } }
        ) {
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
            }
        }
    }
`
