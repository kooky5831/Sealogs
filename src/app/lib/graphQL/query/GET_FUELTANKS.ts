import gql from 'graphql-tag'

export const GET_FUELTANKS = gql`
    query GetFuelTanks($id: [ID]!) {
        readFuelTanks(filter: { id: { in: $id } }) {
            nodes {
                id
                title
                identifier
                archived
                componentCategory
                capacity
                safeFuelCapacity
                currentLevel
                lastEdited
                fuelType
                dipType
                dipConversions
                dipImportID
                dipImportRun
                fuelTankStartStops {
                    nodes {
                        id
                        engineID
                    }
                }
            }
        }
    }
`
