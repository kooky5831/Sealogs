import gql from 'graphql-tag'

export const GET_TRIPREPORT_STOP_BY_ID = gql`
    query GetTripReport_StopById($id: ID!) {
        readOneTripReport_Stop(filter: { id: { eq: $id } }) {
            id
        }
    }
`
