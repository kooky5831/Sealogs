import gql from 'graphql-tag'

export const DownloadCrewTraining_LogBookEntrySections = gql`
    query DownloadCrewTraining_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readCrewTraining_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                trainingType
                trainingLocation
                trainingSummary
                trainingTime
                migrated
                sectionSignature {
                    id
                    signatureData
                    member {
                        id
                        firstName
                        surname
                    }
                }
                createdBy {
                    id
                    firstName
                    surname
                }
                trainer {
                    id
                    firstName
                    surname
                }
                sectionMemberComments {
                    nodes {
                        id
                    }
                }
                members {
                    nodes {
                        id
                        firstName
                        surname
                    }
                }
                logBookEntry {
                    id
                    vehicle {
                        id
                        title
                    }
                }
            }
        }
    }
`
