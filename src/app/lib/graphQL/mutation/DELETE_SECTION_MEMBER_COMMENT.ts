import gql from 'graphql-tag'

export const DELETE_SECTION_MEMBER_COMMENT = gql`
    mutation DeleteSectionMemberComments($ids: [ID]!) {
        deleteSectionMemberComments(ids: $ids)
    }
`
