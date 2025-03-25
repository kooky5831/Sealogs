import gql from 'graphql-tag'

export const GET_SEWAGESYSTEMS = gql`
    query GetSewageSystems($id: [ID]!) {
        readSewageSystems(filter: { id: { in: $id } }) {
            nodes {
                id
                title
                identifier
                archived
                componentCategory
                capacity
                numberOfTanks
            }
        }
    }
`
