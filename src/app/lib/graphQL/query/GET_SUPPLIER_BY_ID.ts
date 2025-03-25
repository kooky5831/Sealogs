import gql from 'graphql-tag'

export const GET_SUPPLIER_BY_ID = gql`
    query GetSupplier($id: ID!) {
        readOneSupplier(filter: { id: { eq: $id } }) {
            id
            name
            address
            website
            email
            phone
            contactPerson
            archived
            clientID
            inventories {
                nodes {
                    id
                    title
                }
            }
        }
    }
`
