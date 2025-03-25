import gql from 'graphql-tag'

export const GET_RECURRING_TASK = gql`
    query GET_RECURRING_TASK($id: ID!) {
        readOneMaintenanceSchedule(filter: { id: { eq: $id } }) {
            id
            title
            description
            type
            occursEveryType
            occursEvery
            warnWithinType
            highWarnWithin
            mediumWarnWithin
            lowWarnWithin
            groupTo
            maintenanceChecks {
                nodes {
                    id
                }
            }
            engineUsage {
                nodes {
                    id
                    engine {
                        id
                        title
                        currentHours
                    }
                    lastScheduleHours
                    isScheduled
                }
            }
            inventoryID
            clientID
        }
    }
`
