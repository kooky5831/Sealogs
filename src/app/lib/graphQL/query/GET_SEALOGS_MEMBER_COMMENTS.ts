import gql from 'graphql-tag'

export const GET_SEALOGS_MEMBER_COMMENTS = gql`
    query {
        readSectionMemberComments(sort: { id: DESC }) {
            nodes {
                id
                className
                lastEdited
                created
                uniqueID
                commentType
                fieldName
                workOrderNumber
                comment
                detail
                clientID
                seaLogsMemberID
                logBookEntryID
                logBookEntrySectionID
                maintenanceCheckID
                seaLogsMember {
                    firstName
                    surname
                }
                logBookEntry {
                    id
                    vehicleID
                    vehicle {
                        title
                    }
                }
                logBookEntrySection {
                    id
                    logBookEntryID
                }
                maintenanceCheck {
                    id
                    name
                }
            }
        }
    }
`
