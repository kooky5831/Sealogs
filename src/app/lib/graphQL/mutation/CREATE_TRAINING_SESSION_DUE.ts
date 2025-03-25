import gql from 'graphql-tag'

export const CREATE_TRAINING_SESSION_DUE = gql`
    mutation CreateTrainingSessionDue($input: CreateTrainingSessionDueInput!) {
        createTrainingSessionDue(input: $input) {
            id
        }
    }
`
