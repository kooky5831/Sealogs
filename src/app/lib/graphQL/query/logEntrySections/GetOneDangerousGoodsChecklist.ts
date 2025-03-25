import gql from 'graphql-tag'

export const GetOneDangerousGoodsChecklist = gql`
    query GetOneDangerousGoodsChecklist($id: ID!) {
        readOneDangerousGoodsChecklist(filter: { id: { eq: $id } }) {
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
    }
`
