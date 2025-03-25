import gql from 'graphql-tag'

export const DownloadTripEvents = gql`
    query DownloadTripEvents($limit: Int = 100, $offset: Int = 0) {
        readTripEvents(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                eventCategory
                vehicle
                notes
                location
                numberPax
                start
                end
                eventType_VesselRescueID
                eventType_PersonRescueID
                eventType_BarCrossingID
                eventType_RefuellingBunkeringID
                eventType_RestrictedVisibilityID
                eventType_PassengerDropFacilityID
                eventType_TaskingID
                crewTrainingID
                supernumeraryID
            }
        }
    }
`
