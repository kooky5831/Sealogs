import gql from 'graphql-tag'

export const GetTripEvent = gql`
    query GetTripEvent($id: ID!) {
        readOneTripEvent(filter: { id: { eq: $id } }) {
            id
            eventCategory
            vehicle
            notes
            location
            numberPax
            start
            end
            eventType_VesselRescue {
                id
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
                missionID
                vesselLocationID
                tripEventID
                operationType
                operationDescription
                vesselTypeDescription
                missionTimeline(filter: { archived: { eq: false } }) {
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
                    lat
                    long
                    missionTimeline(filter: { archived: { eq: false } }) {
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
                    lat
                    long
                    title
                }
            }
            eventType_PersonRescue {
                id
                personName
                gender
                age
                personDescription
                cgMembershipNumber
                personOtherDetails
                cgMembershipType
                cgMembershipNumber
                missionID
                tripEventID
                operationType
                operationDescription
                missionTimeline(filter: { archived: { eq: false } }) {
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
                mission {
                    id
                    missionType
                    description
                    operationOutcome
                    completedAt
                    operationDescription
                    eventType
                    vesselPositionID
                    lat
                    long
                    currentLocation {
                        id
                        lat
                        long
                        title
                    }
                    missionTimeline(filter: { archived: { eq: false } }) {
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
            }
            eventType_BarCrossing {
                id
                geoLocationID
                time
                stopAssessPlan
                crewBriefing
                weather
                stability
                waterTightness
                lifeJackets
                lookoutPosted
                report
                lat
                long
                timeCompleted
                latCompleted
                longCompleted
                geoLocationCompletedID
                barCrossingChecklist {
                    id
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
            eventType_RestrictedVisibility {
                id
                startLocationID
                crossingTime
                estSafeSpeed
                stopAssessPlan
                crewBriefing
                navLights
                soundSignal
                lookout
                soundSignals
                radarWatch
                radioWatch
                endLocationID
                crossedTime
                approxSafeSpeed
                report
                startLat
                startLong
                endLat
                endLong
            }
            eventType_PassengerDropFacility {
                id
                time
                title
                fuelLevel
                paxOn
                paxOff
                lat
                long
                type
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
            eventType_Tasking {
                id
                time
                title
                fuelLevel
                lat
                cgop
                sarop
                long
                type
                operationType
                geoLocationID
                vesselRescueID
                personRescueID
                groupID
                comments
                status
                tripEventID
                pausedTaskID
                openTaskID
                completedTaskID
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
            crewTraining {
                id
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
        }
    }
`
