import gql from 'graphql-tag'
export const CREATE_TRAINING_SESSION = gql`
    mutation CreateTrainingSession($input: CreateTrainingSessionInput!) {
        createTrainingSession(input: $input) {
            id
        }
    }
`
