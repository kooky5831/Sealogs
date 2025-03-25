import gql from 'graphql-tag'

export const GET_CUSTOMISEDLOGBOOKCONFIG_BY_ID = gql`
    query GetCustomisedLogBookConfigById($id: ID!) {
        readOneCustomisedLogBookConfig(filter: { id: { eq: $id } }) {
            id
        }
    }
`
