import gql from 'graphql-tag'

export const READ_TRAINING_SESSION_DUES = gql`
    query ReadTrainingSessionDues(
        $limit: Int = 0
        $offset: Int = 0
        $filter: TrainingSessionDueFilterFields = {}
    ) {
        readTrainingSessionDues(
            limit: $limit
            offset: $offset
            filter: $filter
            sort: {
                dueDate: ASC
                trainingTypeID: ASC
                vesselID: ASC
                memberID: ASC
            }
        ) {
            pageInfo {
                totalCount
                hasNextPage
                hasPreviousPage
            }
            nodes {
                id
                dueDate
                lastTrainingDate
                memberID
                member {
                    id
                    firstName
                    surname
                }
                vesselID
                vessel {
                    id
                    title
                    seaLogsMembers {
                        nodes {
                            id
                            firstName
                            surname
                        }
                    }
                }
                trainingTypeID
                trainingType {
                    id
                    title
                }
            }
        }
    }
`
