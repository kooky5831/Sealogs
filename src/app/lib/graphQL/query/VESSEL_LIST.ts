import gql from 'graphql-tag'

export const VESSEL_LIST = gql`
    query ReadVessels(
        $limit: Int
        $offset: Int
        $filter: VesselFilterFields = {}
        $entryFilter: LogBookEntryFilterFields = {
            state: { in: [Editing, Reopened] }
        }
    ) {
        readVessels(filter: $filter, limit: $limit, offset: $offset) {
            nodes {
                id
                archived
                title
                registration
                callSign
                icon
                iconMode
                photoID
                minCrew
                showOnDashboard
                vesselType
                vehiclePositions(sort: { created: DESC }, limit: 1) {
                    nodes {
                        id
                        lat
                        long
                        geoLocation {
                            id
                            title
                            lat
                            long
                        }
                    }
                }
                parentComponent_Components {
                    nodes {
                        basicComponent {
                            id
                            title
                            componentCategory
                        }
                        parentComponent {
                            id
                            title
                        }
                    }
                }
                logBookEntries(filter: $entryFilter, limit: 1) {
                    nodes {
                        id
                    }
                }
                trainingSessionsDue {
                    nodes {
                        dueDate
                        vesselID
                        trainingType {
                            id
                            title
                        }
                    }
                }
                componentMaintenanceChecks {
                    nodes {
                        archived
                        name
                        expires
                        status
                        completed
                        maintenanceSchedule {
                            __typename
                        }
                    }
                }
            }
        }
    }
`
