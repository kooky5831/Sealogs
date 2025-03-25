import gql from 'graphql-tag'

export const GetVesselLastFuel = gql`
    query GetVesselLastFuel($id: ID!) {
        readOneVessel(filter: { id: { eq: $id } }) {
            id
            title
            logBookEntries(sort: { id: DESC }) {
                nodes {
                    id
                    state
                    tripReportSections: logBookEntrySections(
                        filter: {
                            className: {
                                endswith: "TripReport_LogBookEntrySection"
                            }
                        }
                    ) {
                        nodes {
                            id
                            className
                            tripEvents {
                                nodes {
                                    id
                                    eventType_Tasking {
                                        fuelLevel
                                        fuelLog {
                                            nodes {
                                                id
                                                fuelAdded
                                                fuelBefore
                                                fuelAfter
                                                date
                                                fuelTank {
                                                    id
                                                    capacity
                                                    safeFuelCapacity
                                                    currentLevel
                                                    title
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`
