import gql from 'graphql-tag'

export const LogBookSignOff_LogBookEntrySection = gql`
    query GetLogBookSignOff_LogBookEntrySections($id: [ID]!) {
        readLogBookSignOff_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
                review
                safetyEquipmentCheck
                forecastAccuracy
                ais
                created
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
