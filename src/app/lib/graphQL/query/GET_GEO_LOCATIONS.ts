import gql from 'graphql-tag'

export const GET_GEO_LOCATIONS = gql`
    query GetGeoLocations {
        readGeoLocations {
            nodes {
                id
                archived
                title
                lat
                long
            }
        }
    }
`
