import gql from 'graphql-tag'

export const UPDATE_SECTION_MEMBER_COMMENT = gql`
    mutation UpdateSectionMemberComment(
        $input: UpdateSectionMemberCommentInput!
    ) {
        updateSectionMemberComment(input: $input) {
            id
        }
    }
`
