import gql from 'graphql-tag'

export const CREATE_MEMBER_TRAINING_SIGNATURE = gql`
    mutation CreateMemberTraining_Signature(
        $input: CreateMemberTraining_SignatureInput!
    ) {
        createMemberTraining_Signature(input: $input) {
            id
        }
    }
`
