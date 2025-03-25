import gql from 'graphql-tag'

export const TripReport_LogBookEntrySection_Brief = gql`
    query GetTripReport_LogBookEntrySections_Brief($id: [ID]!) {
        readTripReport_LogBookEntrySections(
            filter: { id: { in: $id } }
            sort: { created: DESC }
        ) {
            nodes {
                id
                archived
                created
                depart
                lastEdited
                departFrom
                arrive
                arriveTo
                departTime
                fromLat
                fromLong
                arriveTime
                totalVehiclesCarried
                toLat
                toLong
                pob
                comment
                dangerousGoodsRecords {
                    nodes {
                        id
                        comment
                        type
                    }
                }
                tripEvents(sort: { created: ASC }) {
                    nodes {
                        id
                        eventCategory
                        created
                        eventType_PassengerDropFacilityID
                        eventType_TaskingID
                        eventType_PassengerDropFacility {
                            id
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
                        eventType_RefuellingBunkering {
                            id
                            date
                            title
                            lat
                            long
                            notes
                            geoLocationID
                            geoLocation {
                                id
                                title
                                lat
                                long
                            }
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
                        eventType_Tasking {
                            id
                            fuelLevel
                            type
                            cgop
                            sarop
                            pausedTaskID
                            openTaskID
                            completedTaskID
                            groupID
                            parentTaskingID
                            towingChecklist {
                                id
                            }
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
                fromLocation {
                    id
                    title
                    lat
                    long
                }
                toLocation {
                    id
                    title
                    lat
                    long
                }
            }
        }
    }
`
