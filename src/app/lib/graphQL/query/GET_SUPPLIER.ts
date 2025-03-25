import gql from 'graphql-tag'

export const GET_SUPPLIER = gql`
    query ReadSuppliers(
        $limit: Int = 100
        $offset: Int = 0
        $filter: SupplierFilterFields = {}
    ) {
        readSuppliers(limit: $limit, offset: $offset, filter: $filter) {
            nodes {
                id
                name
                address
                website
                email
                phone
                contactPerson
                archived
                inventories {
                    nodes {
                        id
                    }
                }
                clientID
                className
                lastEdited
            }
            pageInfo {
                totalCount
                hasNextPage
                hasPreviousPage
            }
        }
    }
`
