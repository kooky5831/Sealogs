import gql from 'graphql-tag'

export const DownloadLogBookSignOff_LogBookEntrySections = gql`
    query DownloadLogBookSignOff_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readLogBookSignOff_LogBookEntrySections(
            limit: $limit
            offset: $offset
        ) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                review
                safetyEquipmentCheck
                forecastAccuracy
                ais
                navigationLightsAndShapes
                electronicNavigationalAids
                mainEngines
                auxiliarySystems
                fuelAndOil
                bilgeSystems
                power
                batteryMaintenance
                circuitInspections
                mooringAndAnchoring
                cargoAndAccessEquipment
                hatchesAndWatertightDoors
                galleyAppliances
                wasteManagement
                ventilationAndAirConditioning
                emergencyReadiness
                environmentalCompliance
                navigationAndBridgeEquipment
                engineRoomAndMachinery
                electricalSystems
                deckOperations
                accommodationAndGalley
                finalChecks
                signOffMemberID
                fuelStart
                sectionSignatureID
                completedTime
                sectionSignature {
                    id
                    signatureData
                }
            }
        }
    }
`
