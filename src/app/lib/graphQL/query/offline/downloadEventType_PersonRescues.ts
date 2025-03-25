import gql from 'graphql-tag'
//
export const DownloadEventType_PersonRescues = gql`
    query DownloadEventType_PersonRescues($limit: Int = 100, $offset: Int = 0) {
        readEventType_PersonRescues(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                operationType
                operationDescription
                personName
                gender
                age
                personDescription
                cgMembershipType
                cgMembershipNumber
                personOtherDetails
                missionID
                tripEventID
            }
        }
    }
`
