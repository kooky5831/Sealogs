import gql from 'graphql-tag'

export const GET_CREW_BY_IDS = gql`
    query GetSeaLogsMembers($crewMemberIDs: [ID]) {
        readSeaLogsMembers(filter: { id: { in: $crewMemberIDs } }) {
            nodes {
                id
                archived
                phoneNumber
                alternatePhoneNumber
                isMaster
                isCrew
                isPilot
                isTransferee
                username
                dashboardVessels
                viewArchivedMode
                requireMFA
                firstName
                surname
                email
                seaLogsTheme
                defaultRegisteredMethodID
                hasSkippedMFARegistration
                accountResetHash
                accountResetExpired
                clientID
                trainingSessionsDue {
                    nodes {
                        id
                        dueDate
                        memberID
                        member {
                            id
                            firstName
                            surname
                        }
                        vesselID
                        vessel {
                            id
                            title
                        }
                        trainingTypeID
                        trainingType {
                            id
                            title
                        }
                    }
                }
                primaryDuty {
                    id
                    archived
                    title
                    abbreviation
                }
                currentVehicleID
                className
                lastEdited
                crewTraining_LogBookEntrySections {
                    nodes {
                        id
                    }
                }
                vehicles {
                    nodes {
                        id
                        title
                    }
                }
                logBookEntries {
                    nodes {
                        id
                    }
                }
                groups {
                    nodes {
                        id
                    }
                }
                departments {
                    nodes {
                        id
                        title
                    }
                }
            }
        }
    }
`
