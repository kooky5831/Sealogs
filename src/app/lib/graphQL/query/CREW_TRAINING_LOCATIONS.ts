import gql from 'graphql-tag'

export const CREW_TRAINING_LOCATIONS = gql`
    query {
        readTrainingLocations {
            nodes {
                id
                title
            }
        }
    }
`
