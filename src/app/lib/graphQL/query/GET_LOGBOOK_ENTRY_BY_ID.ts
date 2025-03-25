import gql from 'graphql-tag'

export const GET_LOGBOOK_ENTRY_BY_ID = gql`
    query GetLogBookEntries($logbookEntryId: ID!) {
        readOneLogBookEntry(filter: { id: { eq: $logbookEntryId } }) {
            id
            masterID
            state
            className
            startDate
            endDate
            fuelLevel
            logBookID
            createdByID
            signOffCommentID
            signOffSignatureID
            clientID
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
            engineStartStop {
                nodes {
                    id
                    hoursStart
                    engineID
                    engine {
                        id
                        title
                        currentHours
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
`
