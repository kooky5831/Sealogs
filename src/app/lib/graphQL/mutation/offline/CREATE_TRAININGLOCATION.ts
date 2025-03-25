import gql from 'graphql-tag'

export const CREATE_TRAININGLOCATION = gql`
    mutation CreateTrainingLocation($input: CreateTrainingLocationInput!) {
        createTrainingLocation(input: $input) {
            id
        }
    }
`