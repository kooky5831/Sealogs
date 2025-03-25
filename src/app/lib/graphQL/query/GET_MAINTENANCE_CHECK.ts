import gql from 'graphql-tag'

export const GET_MAINTENANCE_CHECK = gql`
    query ReadComponentMaintenanceChecks(
        $limit: Int = 0
        $offset: Int = 0
        $filter: ComponentMaintenanceCheckFilterFields = {}
    ) {
        readComponentMaintenanceChecks(
            limit: $limit
            offset: $offset
            filter: $filter
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
                basicComponentID
                basicComponent {
                    id
                    title
                }
                assignedToID
                assignedByID
                inventoryID
                maintenanceScheduleID
                maintenanceCheck_Signature {
                    id
                }
                clientID
                recurringID
            }
        }
    }
`
