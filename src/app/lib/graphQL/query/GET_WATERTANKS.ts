import gql from 'graphql-tag'

export const GET_WATERTANKS = gql`
    query GetWaterTanks($id: [ID]!) {
        readWaterTanks(filter: { id: { in: $id } }) {
            nodes {
                id
                title
                identifier
                archived
                componentCategory
                capacity
            }
        }
    }
`
