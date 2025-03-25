import gql from 'graphql-tag'

export const DownloadVessels = gql`
    query DownloadVessels(
        $limit: Int = 100
        $offset: Int = 0
        $entryFilter: LogBookEntryFilterFields = {
            state: { in: [Editing, Reopened] }
        }
    ) {
        readVessels(limit: $limit, offset: $offset, sort: { title: ASC }) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                title
                logBookID
                maxPOB
                archived
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
