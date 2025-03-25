import gql from 'graphql-tag'

export const GetCrewMembersFromOpenLogBook = gql`
    query GetCrewMembersFromOpenLogBook($ids: [ID]!) {
        readCrewMembers_LogBookEntrySections(filter: { id: { in: $ids } }) {
            nodes {
                id
                crewMember {
                    id
                    firstName
                    surname
                    archived
                }
            }
        }
    }
`
