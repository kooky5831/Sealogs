import gql from 'graphql-tag'

export const GET_SECTIONMEMBERCOMMENT = gql`
    query Get_SectionMemberComment($id: ID!) {
        readOneSectionMemberComment(filter: { id: { eq: $id } }) {
            id
        }
    }
`
