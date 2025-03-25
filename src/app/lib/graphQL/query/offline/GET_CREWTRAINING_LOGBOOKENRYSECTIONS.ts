import gql from 'graphql-tag'

export const GET_CREWTRAINING_LOGBOOKENRYSECTIONS = gql`
    query Get_CrewTraining_LogBookEntrySections($id: ID!) {
        readOneCrewTraining_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`