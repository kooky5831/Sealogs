import gql from 'graphql-tag'

export const DownloadMemberTraining_Signatures = gql`
    query DownloadMemberTraining_Signatures(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readMemberTraining_Signatures(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                signatureData
                memberID
                trainingSessionID
                lastEdited
            }
        }
    }
`
