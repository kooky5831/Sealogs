import gql from 'graphql-tag'

export const CREW_LIST = gql`
    query ReadSeaLogsMembers(
        $limit: Int = 0
        $offset: Int = 0
        $filter: SeaLogsMemberFilterFields = {}
    ) {
        readSeaLogsMembers(
            limit: $limit
            offset: $offset
            filter: $filter
            sort: { firstName: ASC, surname: ASC }
        ) {
            pageInfo {
                totalCount
                hasNextPage
                hasPreviousPage
            }
            nodes {
                id
                archived
                firstName
                isCrew
                departments {
                    nodes {
                        id
                    }
                }
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
                groups {
                    nodes {
                        id
                        title
                        code
                        permissions(limit: 1000) {
                            nodes {
                                id
                                type
                                code
                            }
                        }
                    }
                }
            }
        }
    }
`
