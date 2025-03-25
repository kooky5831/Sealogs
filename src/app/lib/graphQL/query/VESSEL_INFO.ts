import gql from 'graphql-tag'

export const VESSEL_INFO = gql`
    query GetVessel($id: ID!) {
        readOneVessel(filter: { id: { eq: $id } }) {
            id
            title
            registration
            logBookID
            seaLogsMembers {
                nodes {
                    id
                    archived
                    firstName
                    surname
                }
            }
            minCrew
            maxPax
            maxPOB
            activities
            numberOfEngines
            numberOfShafts
            sharedFuelTank
            documents {
                nodes {
                    id
                    fileFilename
                    name
                    title
                    created
                }
            }
            vehiclePositions(sort: { created: DESC }, limit: 1) {
                nodes {
                    id
                    lat
                    long
                    geoLocation {
                        id
                        title
                        lat
                        long
                    }
                }
            }
            icon
            metServiceObsLocation
            metServiceForecastLocation
            enableTransitMessaging
            copyCrewToOtherActivites
            templateVisible
            mmsi
            iconMode
            callSign
            countryOfOperation
            showOnDashboard
            transitID
            vesselSpecifics {
                id
                primaryHarbour
                overallLength
                beam
                draft
                dateOfBuild
                hullColor
                hullConstruction
                maxCargoLoad
                operatingAreaLimits
                specialLimitations
                portOfRegistry
                fishingNumber
                loadLineLength
                registeredLength
                tonnageLength
                grossTonnage
                netTonnage
                capacityOfLifting
                carriesDangerousGoods
                designApprovalNumber
            }
            identifier
            archived
            vesselType
            vesselTypeDescription
            vesselSpecificsID
            photoID
            photo {
                id
                fileFilename
                title
                created
            }
            currentTripServiceID
            clientID
            bannerImageID
            componentMaintenanceSchedules {
                nodes {
                    id
                }
            }
            parentComponent_Components {
                nodes {
                    basicComponent {
                        id
                        title
                        componentCategory
                    }
                    parentComponent {
                        id
                        title
                    }
                }
            }
            logBookEntries(sort: { id: DESC }) {
                nodes {
                    id
                    state
                }
            }
            departments {
                nodes {
                    id
                    title
                }
            }
        }
    }
`
