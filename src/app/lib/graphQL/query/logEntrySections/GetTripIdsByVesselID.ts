import gql from 'graphql-tag'

export const GetTripIdsByVesselID = gql`
    query GetTripsByVesselID($id: ID!) {
        readOneVessel(filter: { id: { eq: $id } }) {
            id
            title
            registration
            logBookID
            logBookEntries(sort: { id: DESC }) {
                nodes {
                    id
                    state
                    logBookEntrySections(
                        filter: {
                            className: {
                                endswith: "TripReport_LogBookEntrySection"
                            }
                        }
                    ) {
                        nodes {
                            id
                            className
                        }
                    }
                }
            }
        }
    }
`
