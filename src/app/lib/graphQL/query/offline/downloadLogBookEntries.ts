import gql from 'graphql-tag'

export const DownloadLogBookEntries = gql`
    query DownloadLogBookEntries($limit: Int = 100, $offset: Int = 0) {
        readLogBookEntries(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                masterID
                startDate
                endDate
                logBookID
                fuelLevel
                createdByID
                signOffCommentID
                signOffSignatureID
                clientID
                state
                vehicleID
                className
                lockedDate
                fuelLog {
                    nodes {
                        id
                        fuelAdded
                        fuelBefore
                        fuelAfter
                        date
                        fuelTank {
                            id
                            capacity
                            safeFuelCapacity
                            currentLevel
                            title
                        }
                    }
                }
                logBook {
                    id
                    title
                    componentConfig
                }
                master {
                    id
                    firstName
                    surname
                }
                logBookEntrySections {
                    nodes {
                        id
                        className
                        logBookComponentClass
                    }
                }
                vehicle {
                    id
                    seaLogsMembers {
                        nodes {
                            id
                            firstName
                            surname
                            archived
                            primaryDutyID
                        }
                    }
                }
            }
        }
    }
`
