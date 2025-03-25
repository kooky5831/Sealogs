import gql from 'graphql-tag'

export const GET_ENGINEUSEAE_BY_ID = gql`
    query GetEngineUsageById($id: ID!) {
        readOneCGEventMission(filter: { id: { eq: $id } }) {
            id
        }
    }
`