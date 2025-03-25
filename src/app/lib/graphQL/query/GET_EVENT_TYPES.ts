import gql from 'graphql-tag'

export const GET_EVENT_TYPES = gql`
    query GetEventTypes {
        readEventTypes {
            nodes {
                id
                archived
                title
            }
        }
    }
`
