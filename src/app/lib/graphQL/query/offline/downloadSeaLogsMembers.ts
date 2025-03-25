import gql from 'graphql-tag'

export const DownloadSeaLogsMembers = gql`
    query DownloadSeaLogsMembers($limit: Int = 100, $offset: Int = 0) {
        readSeaLogsMembers(
            limit: $limit
            offset: $offset
            sort: { firstName: ASC, surname: ASC }
        ) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                firstName
                isCrew
                primaryDutyID
                primaryDuty {
                    id
                    title
                }
                surname
                vehicles {
                    nodes {
                        id
                        title
                    }
                }
                trainingSessionsDue {
                    nodes {
                        id
                        dueDate
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
                        }
                        trainingTypeID
                        trainingType {
                            id
                            title
                        }
                    }
                }
                trainingSessions {
                    nodes {
                        id
                        members {
                            nodes {
                                id
                                firstName
                                surname
                            }
                        }
                    }
                }
            }
        }
    }
`
