import gql from 'graphql-tag'

export const DASHBOARD_VESSEL_LIST = gql`
    query {
        readDashboardData {
            vessels {
                id
                showOnDashboard
                title
                icon
                iconMode
                photoID
                registration
                callSign
                trainingsDue
                tasksDue
                logentryID
                lbeStartDate
                pob
            }
        }
    }
`
