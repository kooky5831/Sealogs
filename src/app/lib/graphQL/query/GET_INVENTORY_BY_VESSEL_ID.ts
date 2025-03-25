import gql from 'graphql-tag'

export const GET_INVENTORY_BY_VESSEL_ID = gql`
    query GetInventories($vesselId: ID!) {
        readInventories(filter: { vesselID: { eq: $vesselId } }) {
            nodes {
                id
                item
                location
                description
                content
                attachments {
                    nodes {
                        id
                    }
                }
                quantity
                productCode
                costingDetails
                comments
                formID
                formType
                formLabel
                showForm
                title
                identifier
                componentCategory
                archived
                uniqueID
                componentMaintenanceSchedules {
                    nodes {
                        id
                    }
                }
                componentMaintenanceChecks {
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
                suppliers {
                    nodes {
                        id
                        name
                        email
                        phone
                        address
                    }
                }
                categories {
                    nodes {
                        id
                        name
                    }
                }
                vesselID
                vessel {
                    id
                    title
                }
                inventoryImportID
                clientID
                className
                lastEdited
            }
        }
    }
`
