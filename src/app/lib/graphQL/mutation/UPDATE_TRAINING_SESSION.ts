import gql from 'graphql-tag'
export const UPDATE_TRAINING_SESSION = gql`
    mutation UpdateTrainingSession($input: UpdateTrainingSessionInput!) {
        updateTrainingSession(input: $input) {
            id
        }
    }
`
