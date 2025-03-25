import gql from 'graphql-tag'

export const DownloadTrainingTypes = gql`
    query DownloadTrainingTypes($limit: Int = 100, $offset: Int = 0) {
        readTrainingTypes(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                title
                procedure
                occursEvery
                highWarnWithin
                mediumWarnWithin
                trainingSessions {
                    nodes {
                        id
                        vesselID
                    }
                }
                vessels {
                    nodes {
                        id
                    }
                }
            }
        }
    }
`
