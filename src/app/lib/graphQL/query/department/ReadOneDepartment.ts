import gql from 'graphql-tag'

export const ReadOneDepartment = gql`
    query ReadOneDepartment($id: ID!) {
        readOneDepartment(filter: { id: { eq: $id } }) {
            id
            title
            parentID
            parent {
                id
                title
            }
            children {
                nodes {
                    id
                    title
                }
            }
            seaLogsMembers {
                nodes {
                    id
                    firstName
                    surname
                }
            }
        }
    }
`
