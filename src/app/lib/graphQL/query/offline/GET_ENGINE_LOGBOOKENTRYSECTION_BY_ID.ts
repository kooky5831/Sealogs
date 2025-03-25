import gql from 'graphql-tag'

export const GET_ENGINE_LOGBOOKENTRYSECTION_BY_ID = gql`
    query GetEngineLogBookEntrySectionById($id: ID!) {
        readOneEngine_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
