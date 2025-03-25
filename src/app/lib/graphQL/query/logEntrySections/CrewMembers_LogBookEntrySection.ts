import gql from 'graphql-tag'

export const CrewMembers_LogBookEntrySection = gql`
    query GetCrewMembers_LogBookEntrySections(
        $filter: CrewMembers_LogBookEntrySectionFilterFields = {}
    ) {
        readCrewMembers_LogBookEntrySections(filter: $filter) {
            nodes {
                id
                punchIn
                punchOut
                archived
                dutyHours
                workDetails
                userDefinedData
                crewMemberID
                crewMember {
                    id
                    firstName
                    surname
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
                }
                dutyPerformed {
                    id
                    title
                    abbreviation
                }
                logBookEntry {
                    id
                    startDate
                    vehicle {
                        id
                        title
                    }
                }
            }
        }
    }
`
