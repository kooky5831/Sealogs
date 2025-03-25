import gql from 'graphql-tag'

export const MAINTENANCE_LIST_WITH_DOCUMENT = gql`
    query getMaintenanceListWithDocuments {
        readComponentMaintenanceChecks {
            nodes {
                id
                workOrderNumber
                groupItemTo
                projected
                actual
                difference
                name
                startDate
                documents {
                    nodes {
                        id
                        fileFilename
                        name
                        title
                        created
                    }
                }
            }
        }
    }
`
