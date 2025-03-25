import gql from 'graphql-tag'

export const UPDATE_TRAININGLOCATION = gql`
    mutation UpdateTrainingLocation($input: UpdateTrainingLocationInput!) {
        updateTrainingLocation(input: $input) {
            id
        }
    }
`