import gql from 'graphql-tag'

export const GetTripReport_Stop = gql`
    query GetTripReport_Stop($id: ID!) {
        readOneTripReport_Stop(filter: { id: { eq: $id } }) {
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
            stopLocation {
                id
                title
                lat
                long
            }
            dangerousGoodsRecords {
                nodes {
                    id
                    comment
                    type
                }
            }
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
        }
    }
`
