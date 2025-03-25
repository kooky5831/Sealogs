import gql from 'graphql-tag'

export const DownloadDangerousGoodsChecklists = gql`
    query DownloadDangerousGoodsChecklists(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readDangerousGoodsChecklists(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
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
                memberID
                vesselID
                tripReport_StopID
            }
        }
    }
`
