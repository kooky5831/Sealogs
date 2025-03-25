import gql from 'graphql-tag'

export const DownloadSectionMemberComments = gql`
    query DownloadSectionMemberComments($limit: Int = 100, $offset: Int = 0) {
        readSectionMemberComments(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                commentType
                fieldName
                comment
                logBookEntrySectionID
                hideComment
            }
        }
    }
`
