import gql from 'graphql-tag'

export const DownloadTrainingSessionDues = gql`
    query DownloadTrainingSessionDues($limit: Int = 100, $offset: Int = 0) {
        readTrainingSessionDues(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                dueDate
                lastTrainingDate
                memberID
                trainingTypeID
                vesselID
                trainingSessionID
                warningLevel
            }
        }
    }
`
