import gql from 'graphql-tag'

export const READ_ONE_SEALOGS_MEMBER = gql`
    query ReadOneSeaLogsMember($filter: SeaLogsMemberFilterFields) {
        readOneSeaLogsMember(filter: $filter) {
            id
            firstName
            surname
            superAdmin
            clientID
            client {
                title
                useDepartment
            }
            currentDepartmentID
            currentDepartment {
                id
                title
            }
            groups {
                nodes {
                    id
                    title
                    code
                    permissions(limit: 1000) {
                        nodes {
                            id
                            code
                        }
                    }
                }
            }
            departments {
                nodes {
                    id
                    title
                    basicComponents {
                        nodes {
                            id
                            title
                            identifier
                        }
                    }
                }
            }
        }
    }
`
