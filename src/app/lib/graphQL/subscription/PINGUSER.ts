import gql from 'graphql-tag'

export const PINGUSER = gql`
    subscription PingUser($id: ID!) {
        onUpdatePingUsers(filter: { id: { eq: $id } }) {
            id
        }
    }
`
