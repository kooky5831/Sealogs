import gql from 'graphql-tag'

export const GET_MEMBERTRAINING_SIGNATURE_BY_ID = gql`
    query GetOneMemberTraining_Signature($id: ID!) {
        readOneMemberTraining_Signature(filter: { id: { eq: $id } }) {
            id
        }
    }
`
