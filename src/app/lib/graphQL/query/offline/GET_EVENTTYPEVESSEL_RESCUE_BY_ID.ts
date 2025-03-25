import gql from 'graphql-tag'

export const GET_EVENTTYPEVESSEL_RESCUE_BY_ID = gql`
    query Get_EventTypeVessel_Rescue($id: ID!) {
        readOneEventType_VesselRescue(filter: { id: { eq: $id } }) {
            id
        }
    }
`
