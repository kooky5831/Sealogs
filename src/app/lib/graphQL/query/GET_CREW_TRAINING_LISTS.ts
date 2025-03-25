import gql from 'graphql-tag'

export const GET_CREW_TRAINING_LISTS = gql`
    query GetCrewTrainingLists {
        getCrewTrainingLists {
            isSuccess
            data {
                id
                natureOfTraining
                trainer
                trainingLocation
                trainingSummary
            }
        }
    }
`
