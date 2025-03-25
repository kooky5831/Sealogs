import gql from 'graphql-tag'

export const VESSEL_LIST_WITH_DOCUMENTS = gql`
    query getVesselListWithDocuments {
        readVessels {
            nodes {
                id
                archived
                title
                registration
                callSign
                showOnDashboard
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
