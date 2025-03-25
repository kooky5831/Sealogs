import gql from 'graphql-tag'

export const TRAINING_LOCATIONS = gql`
    query {
        readTrainingLocations {
            nodes {
                id
                title
            }
        }
    }
`
