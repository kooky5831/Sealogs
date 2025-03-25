import gql from 'graphql-tag'

export const DELETE_TRAINING_TYPE = gql`
    mutation DeleteTrainingType($id: Int!) {
        deleteTrainingType(id: $id) {
            isSuccess
            data
        }
    }
`
