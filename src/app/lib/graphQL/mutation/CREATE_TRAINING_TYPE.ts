import gql from 'graphql-tag'
export const CREATE_TRAINING_TYPE = gql`
    mutation CreateTrainingType($input: CreateTrainingTypeInput!) {
        createTrainingType(input: $input) {
            id
        }
    }
`
