import gql from 'graphql-tag'

export const GET_REFUELLINGBUNKERING_BY_ID = gql`
    query GetRefuellingBunkeringById($id: ID!) {
        readOneRefuellingBunkering(filter: { id: { eq: $id } }) {
            id
        }
    }
`
