import gql from 'graphql-tag'

export const GET_TRAINING_LOGBOOKENTRSECTION_BY_ID = gql`
    query getTrainingLogbookEntrySectionById($id: ID!) {
        readOneCrewTraining_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
