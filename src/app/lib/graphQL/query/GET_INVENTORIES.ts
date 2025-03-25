import gql from 'graphql-tag'

export const GET_INVENTORIES = gql`
    query ReadInventories(
        $limit: Int = 100
        $offset: Int = 0
        $filter: InventoryFilterFields = {}
    ) {
        readInventories(limit: $limit, offset: $offset, filter: $filter) {
            pageInfo {
                totalCount
                hasNextPage
                hasPreviousPage
            }
            nodes {
                id
                item
                location
                attachments {
                    nodes {
                        id
                    }
                }
                description
                content
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
            }
        }
    }
`
