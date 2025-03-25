import gql from 'graphql-tag'

export const GET_EVENTTYPEBARCROSSING_BY_ID = gql`
    query GetEventTypeBarCrossigById($id: ID!) {
        readOneEventType_BarCrossing(filter: { id: { eq: $id } }) {
            id
        }
    }
`
