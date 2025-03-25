import gql from 'graphql-tag'

export const Fuel_LogBookEntrySection = gql`
    query GetFuel_LogBookEntrySections($id: [ID]!) {
        readFuel_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
                fuelTankStartStops {
                    nodes {
                        id
                        start
                        end
                        fuelType
                        comments
                        fuelTankID
                    }
                }
            }
        }
    }
`
