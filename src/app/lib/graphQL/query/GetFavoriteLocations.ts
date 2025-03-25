import gql from 'graphql-tag'

export const GetFavoriteLocations = gql`
    query GetFavoriteLocations($userID: ID!) {
        readFavoriteLocations(
            filter: { memberID: { eq: $userID } }
            sort: { usage: DESC }
        ) {
            nodes {
                id
                usage
                geoLocationID
            }
        }
    }
`
