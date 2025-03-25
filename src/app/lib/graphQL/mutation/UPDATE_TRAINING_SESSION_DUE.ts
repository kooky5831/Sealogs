import gql from 'graphql-tag'

export const UPDATE_TRAINING_SESSION_DUE = gql`
    mutation UpdateTrainingSessionDue($input: UpdateTrainingSessionDueInput!) {
        updateTrainingSessionDue(input: $input) {
            id
        }
    }
`
