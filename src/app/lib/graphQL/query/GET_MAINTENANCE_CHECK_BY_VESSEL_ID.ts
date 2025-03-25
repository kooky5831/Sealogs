import gql from 'graphql-tag'

export const GET_MAINTENANCE_CHECK_BY_VESSEL_ID = gql`
    query GetComponentMaintenanceChecks($vesselId: ID!) {
        readComponentMaintenanceChecks(
            filter: { basicComponentID: { eq: $vesselId } }
        ) {
            nodes {
                id
                workOrderNumber
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
                maintenanceCheck_Signature {
                    id
                }
                clientID
            }
        }
    }
`
