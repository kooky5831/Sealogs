import gql from 'graphql-tag'

export const DetailedTripReport_LogBookEntrySection = gql`
    query GetTripReport_LogBookEntrySections($id: [ID]!) {
        readTripReport_LogBookEntrySections(
            filter: { id: { in: $id } }
            sort: { created: ASC }
        ) {
            nodes {
                id
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
                dangerousGoodsRecords {
                    nodes {
                        id
                        comment
                        type
                    }
                }
                enableDGR
                designatedDangerousGoodsSailing
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
                    member {
                        id
                        firstName
                        surname
                    }
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
                            operationType
                            vesselRescue {
                                vesselName
                                callSign
                                pob
                                latitude
                                longitude
                                locationDescription
                                vesselLength
                                vesselType
                                makeAndModel
                                color
                                ownerName
                                phone
                                email
                                address
                                ownerOnBoard
                                cgMembershipType
                                cgMembership
                                operationType
                                operationDescription
                                vesselTypeDescription
                                mission {
                                    id
                                    missionType
                                    description
                                    operationOutcome
                                    completedAt
                                    operationDescription
                                    eventType
                                    vesselPositionID
                                    currentLocation {
                                        id
                                        lat
                                        long
                                        title
                                    }
                                    missionTimeline(
                                        filter: { archived: { eq: false } }
                                    ) {
                                        nodes {
                                            id
                                            commentType
                                            description
                                            time
                                            subTaskID
                                            author {
                                                id
                                                firstName
                                                surname
                                                email
                                            }
                                        }
                                    }
                                }
                                vesselLocation {
                                    id
                                    title
                                    lat
                                    long
                                }
                                missionTimeline {
                                    nodes {
                                        id
                                        commentType
                                        description
                                        time
                                        subTaskID
                                        author {
                                            id
                                            firstName
                                            surname
                                            email
                                        }
                                    }
                                }
                            }
                            towingChecklist {
                                id
                                conductSAP
                                investigateNatureOfIssue
                                everyoneOnBoardOk
                                rudderToMidshipsAndTrimmed
                                lifejacketsOn
                                communicationsEstablished
                                secureAndSafeTowing
                                riskFactors {
                                    nodes {
                                        id
                                        type
                                        title
                                        impact
                                        probability
                                    }
                                }
                                member {
                                    id
                                    firstName
                                    surname
                                }
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
                                stopAssessPlan
                                crewBriefing
                                weather
                                stability
                                waterTightness
                                lifeJackets
                                lookoutPosted
                                riskFactors {
                                    nodes {
                                        id
                                        type
                                        title
                                        impact
                                        probability
                                        created
                                    }
                                }
                                member {
                                    id
                                    firstName
                                    surname
                                }
                            }
                        }
                        eventType_RestrictedVisibility {
                            id
                            crossingTime
                            crossedTime
                            startLocationID
                            startLocation {
                                id
                                title
                                lat
                                long
                            }
                            endLocationID
                            endLocation {
                                id
                                title
                                lat
                                long
                            }
                            crewBriefing
                            navLights
                            soundSignals
                            lookout
                            soundSignal
                            radarWatch
                            radioWatch
                            estSafeSpeed
                            approxSafeSpeed
                            startLat
                            startLong
                            endLat
                            endLong
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
                            trainer {
                                id
                                firstName
                                surname
                            }
                            members {
                                nodes {
                                    id
                                    firstName
                                    surname
                                }
                            }
                            trainingTypes {
                                nodes {
                                    id
                                    title
                                }
                            }
                            trainingSummary
                            date
                            geoLocation {
                                id
                                title
                                lat
                                long
                            }
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
                        designatedDangerousGoodsSailing
                        lat
                        long
                        comments
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
