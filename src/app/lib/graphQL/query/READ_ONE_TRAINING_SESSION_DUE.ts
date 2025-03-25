import gql from 'graphql-tag'

export const READ_ONE_TRAINING_SESSION_DUE = gql`
    query ReadOneTrainingSessionDue($filter: TrainingSessionDueFilterFields) {
        readOneTrainingSessionDue(filter: $filter) {
            id
            dueDate
            lastTrainingDate
            memberID
            member {
                id
                firstName
                surname
            }
            trainingTypeID
            trainingType {
                id
                title
            }
            vesselID
            vessel {
                id
                title
            }
        }
    }
`
