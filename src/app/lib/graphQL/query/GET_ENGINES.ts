import gql from 'graphql-tag'

export const GET_ENGINES = gql`
    query GetEngines($id: [ID]!, $filter: EngineStartStopFilterFields = {}) {
        readEngines(filter: { id: { in: $id } }) {
            nodes {
                id
                title
                type
                currentHours
                identifier
                isPrimary
                maxPower
                driveType
                positionOnVessel
                archived
                componentCategory
                make
                model
                kW
                kVA
                engineStartStops(
                    sort: { created: DESC }
                    limit: 1
                    filter: $filter
                ) {
                    nodes {
                        id
                        hoursStart
                        hoursEnd
                        totalHours
                        timeStart
                        timeEnd
                        logBookEntrySection {
                            logBookEntryID
                        }
                    }
                }
            }
        }
    }
`
