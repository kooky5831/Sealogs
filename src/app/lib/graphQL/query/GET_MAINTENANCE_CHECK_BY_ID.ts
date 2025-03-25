import gql from 'graphql-tag'

export const GET_MAINTENANCE_CHECK_BY_ID = gql`
    query GetOneComponentMaintenanceCheck($id: ID!) {
        readOneComponentMaintenanceCheck(filter: { id: { eq: $id } }) {
            id
            workOrderNumber
            groupItemTo
            projected
            actual
            difference
            name
            startDate
            documents {
                nodes {
                    id
                    fileFilename
                    name
                    title
                    created
                }
            }
            maintenanceCategory {
                id
                name
                abbreviation
            }
            completedBy {
                id
                firstName
                surname
            }
            dateCompleted
            attachmentLinks {
                nodes {
                    id
                    link
                }
            }
            records {
                nodes {
                    id
                    time
                    description
                    author {
                        id
                        firstName
                        surname
                    }
                }
            }
            completed
            expires
            dutyHoursAtCheck
            equipmentUsagesAtCheck
            comments
            severity
            status
            archived
            assignees {
                nodes {
                    id
                }
            }
            basicComponentID
            basicComponent {
                id
                title
            }
            assignedToID
            assignedTo {
                id
                firstName
                surname
            }
            assignedByID
            inventoryID
            inventory {
                id
                item
                title
                vessel {
                    id
                    title
                }
            }
            maintenanceScheduleID
            maintenanceSchedule {
                id
                title
                description
                type
                occursEveryType
                occursEvery
                warnWithinType
                highWarnWithin
                mediumWarnWithin
                lowWarnWithin
                groupTo
                maintenanceChecks {
                    nodes {
                        id
                    }
                }
                engineUsage(sort: { created: DESC }) {
                    nodes {
                        id
                        lastScheduleHours
                        isScheduled
                        engine {
                            id
                            title
                            currentHours
                        }
                    }
                }
                inventoryID
                clientID
            }
            maintenanceCheck_Signature {
                id
                signatureData
            }
            clientID
            recurringID
        }
    }
`
