import gql from 'graphql-tag'

export const GetLogBookEntriesMemberIds = gql`
    query GetLogBookEntriesMemberIds {
        readLogBookEntries(filter: { state: { in: [Editing, Reopened] } }) {
            nodes {
                id
                state
                vehicleID
                logBookEntrySections(
                    filter: {
                        logBookComponentClass: {
                            contains: "CrewMembers_LogBookComponent"
                        }
                    }
                ) {
                    nodes {
                        id
                    }
                }
                vehicle {
                    id
                }
            }
        }
    }
`
