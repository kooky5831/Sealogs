import gql from 'graphql-tag'

export const DownloadInventories = gql`
    query DownloadInventories($limit: Int = 100, $offset: Int = 0) {
        readInventories(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                title
                identifier
                componentCategory
                item
                location
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
                vesselID
                inventoryImportID
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
                componentMaintenanceSchedules {
                    nodes {
                        id
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
                attachments {
                    nodes {
                        id
                    }
                }
                categories {
                    nodes {
                        id
                        name
                    }
                }
            }
        }
    }
`
