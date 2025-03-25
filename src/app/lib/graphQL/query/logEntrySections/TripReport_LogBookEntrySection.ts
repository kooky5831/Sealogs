import gql from 'graphql-tag'

export const TripReport_LogBookEntrySection = gql`
    query GetTripReport_LogBookEntrySections($id: [ID]!) {
        readTripReport_LogBookEntrySections(
            filter: { id: { in: $id } }
            sort: { created: ASC }
        ) {
            nodes {
                id
                archived
                sectionSignatureID
                createdByID
                dailyChecksCompleted
                depart
                departFrom
                arrive
                lastEdited
                arriveTo
                departTime
                tripScheduleDepartTime
                fromFreehand
                fromLat
                fromLong
                arriveTime
                tripScheduleArriveTime
                toFreehand
                toLat
                toLong
                pob
                numberPax
                paxJoinedAdult
                paxJoinedChild
                paxJoinedYouth
                paxJoinedFOC
                paxJoinedStaff
                paxJoinedVoucher
                paxJoinedPrePaid
                paxDeparted
                safetyBriefing
                speedExemption
                expectedNextContact
                fromCreatesNewGeoLocation
                toCreatesNewGeoLocation
                voucher
                incidentReports
                hazardReports
                prevPaxState
                comment
                vob
                totalVehiclesCarried
                vehiclesJoined
                vehiclesDeparted
                observedDepart
                observedArrive
                masterID
                leadGuideID
                fromLocationID
                toLocationID
                tripReportScheduleID
                lateDepartureReasonID
                tripUpdateEntityID
                speedExemptionCorridorID
                speedExemptionReasonID
                unscheduledServiceID
                designatedDangerousGoodsSailing
                dangerousGoodsRecords {
                    nodes {
                        id
                        comment
                        type
                    }
                }
                enableDGR
                dangerousGoodsChecklist {
                    id
                    vesselSecuredToWharf
                    bravoFlagRaised
                    twoCrewLoadingVessel
                    fireHosesRiggedAndReady
                    noSmokingSignagePosted
                    spillKitAvailable
                    fireExtinguishersAvailable
                    dgDeclarationReceived
                    loadPlanReceived
                    msdsAvailable
                    anyVehiclesSecureToVehicleDeck
                    safetyAnnouncement
                    vehicleStationaryAndSecure
                    riskFactors {
                        nodes {
                            id
                            type
                            title
                            impact
                            probability
                            created
                            mitigationStrategy {
                                nodes {
                                    id
                                    strategy
                                }
                            }
                        }
                    }
                }
                tripEvents(sort: { created: ASC }) {
                    nodes {
                        id
                        created
                        start
                        end
                        numberPax
                        cause
                        notes
                        location
                        vehicle
                        eventCategory
                        eventType_VesselRescueID
                        eventType_PersonRescueID
                        eventType_BarCrossingID
                        eventType_RestrictedVisibilityID
                        eventType_PassengerDropFacilityID
                        eventType_TaskingID
                        eventType {
                            id
                            title
                        }
                        eventType_PassengerDropFacility {
                            id
                            title
                            fuelLevel
                            time
                            type
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
                            title
                            time
                            type
                            status
                            cgop
                            sarop
                            fuelLevel
                            tripEventID
                            pausedTaskID
                            openTaskID
                            completedTaskID
                            vesselRescueID
                            personRescueID
                            groupID
                            parentTaskingID
                            towingChecklist {
                                id
                            }
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
                        eventType_BarCrossing {
                            id
                            time
                            geoLocation {
                                id
                                title
                                lat
                                long
                            }
                            timeCompleted
                            geoLocationCompleted {
                                id
                                title
                                lat
                                long
                            }
                            barCrossingChecklist {
                                id
                            }
                        }
                        eventType_RestrictedVisibility {
                            id
                            crossingTime
                            crossedTime
                            startLocationID
                            endLocationID
                        }
                        eventType_RefuellingBunkering {
                            id
                            date
                            title
                            lat
                            long
                            notes
                            geoLocation {
                                id
                                title
                                lat
                                long
                            }
                            geoLocationID
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
                        supernumerary {
                            id
                            title
                            totalGuest
                            focGuest
                            isBriefed
                            briefingTime
                            guestList {
                                nodes {
                                    id
                                    firstName
                                    surname
                                    sectionSignature {
                                        id
                                        signatureData
                                    }
                                }
                            }
                        }
                        crewTraining {
                            id
                            startTime
                            finishTime
                        }
                    }
                }
                tripReport_Stops {
                    nodes {
                        id
                        arriveTime
                        departTime
                        paxJoined
                        paxDeparted
                        vehiclesJoined
                        vehiclesDeparted
                        stopLocationID
                        otherCargo
                        lat
                        long
                        comments
                        designatedDangerousGoodsSailing
                        dangerousGoodsChecklistID
                        stopLocation {
                            id
                            title
                            lat
                            long
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
