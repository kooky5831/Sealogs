import gql from 'graphql-tag'

export const GET_MAINTENANCE_CHECK_BY_MEMBER_ID = gql`
    query GetComponentMaintenanceChecks($memberId: ID!) {
        readComponentMaintenanceChecks(
            filter: { assignedToID: { eq: $memberId } }
        ) {
            nodes {
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
                assignedByID
                inventoryID
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
                    engineUsage {
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
            }
        }
    }
`
