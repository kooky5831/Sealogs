import gql from 'graphql-tag'

export const GET_CREW_TRAINING_CONFIG = gql`
    query GetCrewTrainingConfig {
        getCrewTraining {
            isSuccess
            data {
                trainers {
                    id
                    name
                }
                trainingLocation
                trainingTypes {
                    id
                    type
                }
            }
        }
        getCrewMember {
            isSuccess
            data {
                ID
                FirstName
                Surname
            }
        }
    }
`
