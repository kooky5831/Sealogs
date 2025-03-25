import gql from 'graphql-tag'

export const GetOpenLogEntries = gql`
    query GetOpenLogEntries {
        readLogBookEntries(filter: { state: { ne: Locked } }) {
            nodes {
                id
                archived
                vehicle {
                    id
                    title
                    archived
                }
            }
        }
    }
`
