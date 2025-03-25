import gql from 'graphql-tag'

export const CREATE_SECTION_MEMBER_COMMENT = gql`
    mutation CreateSectionMemberComment(
        $input: CreateSectionMemberCommentInput!
    ) {
        createSectionMemberComment(input: $input) {
            id
        }
    }
`
