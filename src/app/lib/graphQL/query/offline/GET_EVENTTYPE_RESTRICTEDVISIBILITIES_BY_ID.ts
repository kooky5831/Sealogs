import gql from 'graphql-tag'

export const GET_EVENTTYPE_RESTRICTEDVISIBILITIES_BY_ID = gql`
    query GetEventTypeRestrictedVisibilitiesById($id: ID!) {
        readOneRefuellingBunkering(filter: { id: { eq: $id } }) {
            id
        }
    }
`
