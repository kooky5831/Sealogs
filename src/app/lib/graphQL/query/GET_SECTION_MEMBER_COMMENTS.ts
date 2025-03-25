import gql from 'graphql-tag'

export const GET_SECTION_MEMBER_COMMENTS = gql`
    query GetSectionMemberComments(
        $limit: Int = 100
        $offset: Int = 0
        $filter: SectionMemberCommentFilterFields = {}
    ) {
        readSectionMemberComments(
            limit: $limit
            offset: $offset
            filter: $filter
        ) {
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
