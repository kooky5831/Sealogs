import gql from 'graphql-tag'

export const DELETE_USER = gql`
    mutation DeleteUser($ids: [ID]!) {
        deleteSeaLogsMembers(ids: $ids)
    }
`
