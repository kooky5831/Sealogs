import gql from 'graphql-tag'

export const DownloadEventType_VesselRescues = gql`
    query DownloadEventType_VesselRescues($limit: Int = 100, $offset: Int = 0) {
        readEventType_VesselRescues(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                vesselName
                callSign
                pob
                latitude
                longitude
                locationDescription
                vesselLength
                vesselType
                makeAndModel
                color
                ownerName
                phone
                email
                address
                ownerOnBoard
                cgMembershipType
                cgMembership
                operationType
                operationDescription
                vesselTypeDescription
                missionID
                vesselLocationID
                tripEventID
            }
        }
    }
`
