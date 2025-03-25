import gql from 'graphql-tag'

export const GET_SEALOGSMEMBER_BY_ID = gql`
    query GetSeaLogsMemberById($id: ID!) {
        readOneSeaLogsMember(filter: { id: { eq: $id } }) {
            id
        }
    }
`
