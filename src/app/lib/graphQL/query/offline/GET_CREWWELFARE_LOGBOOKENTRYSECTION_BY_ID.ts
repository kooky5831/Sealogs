import gql from 'graphql-tag'

export const GET_CREWWELFARE_LOGBOOKENTRYSECTION_BY_ID = gql`
    query GetCrewWelfareLogbookEntrySectionById( $id: ID!) {
        readOneCrewWelfare_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
