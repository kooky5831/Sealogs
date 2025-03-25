import gql from 'graphql-tag'

export const GET_LOGBOOK = gql`
    query Getlogbook($id: ID!) {
        readOneLogBook(filter: { id: { eq: $id } }) {
            id
            title
        }
    }
`
