import gql from 'graphql-tag'

export const GET_MEMBER_TRAINING_SIGNATURES = gql`
    query GetMemberTraining_Signatures(
        $filter: MemberTraining_SignatureFilterFields = {}
    ) {
        readMemberTraining_Signatures(filter: $filter) {
            nodes {
                id
            }
        }
    }
`
