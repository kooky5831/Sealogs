import gql from 'graphql-tag'

export const DeleteGeoLocations = gql`
    mutation DeleteGeoLocations($ids: [ID]!) {
        deleteGeoLocations(ids: $ids)
    }
`
