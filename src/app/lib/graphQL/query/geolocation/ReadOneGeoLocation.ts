import gql from 'graphql-tag'

export const ReadOneGeoLocation = gql`
    query ReadOneGeoLocation($id: ID!) {
        readOneGeoLocation(filter: { id: { eq: $id } }) {
            id
            title
            lat
            long
        }
    }
`
