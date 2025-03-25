import gql from 'graphql-tag'
export const UPDATE_TRAINING_TYPE = gql`
    mutation UpdateTrainingType($input: UpdateTrainingTypeInput!) {
        updateTrainingType(input: $input) {
            id
        }
    }
`
