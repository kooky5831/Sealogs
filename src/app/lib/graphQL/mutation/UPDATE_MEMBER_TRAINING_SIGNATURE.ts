import gql from 'graphql-tag'

export const UPDATE_MEMBER_TRAINING_SIGNATURE = gql`
    mutation UpdateMemberTraining_Signature(
        $input: UpdateMemberTraining_SignatureInput!
    ) {
        updateMemberTraining_Signature(input: $input) {
            id
        }
    }
`
