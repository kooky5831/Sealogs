import gql from 'graphql-tag'

export const GET_INVENTORY_BY_ID = gql`
    query GetOneInventory($id: ID!) {
        readOneInventory(filter: { id: { eq: $id } }) {
            id
            item
            location
            attachments {
                nodes {
                    id
                }
            }
            documents {
                nodes {
                    id
                    fileFilename
                    name
                    title
                    created
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
                    completed
                    documents {
                        nodes {
                            id
                        }
                    }
                    assignees {
                        nodes {
                            id
                        }
                    }
                    maintenanceCategory {
                        id
                        name
                        abbreviation
                    }
                    expires
                    dutyHoursAtCheck
                    equipmentUsagesAtCheck
                    comments
                    severity
                    status
                    archived
                    basicComponentID
                    assignedToID
                    assignedByID
                    inventoryID
                    maintenanceScheduleID
                    maintenanceCheck_SignatureID
                    clientID
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
            attachmentLinks {
                nodes {
                    id
                    link
                }
            }
        }
    }
`
