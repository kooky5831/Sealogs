import gql from 'graphql-tag'

export const ReadDepartments = gql`
    query ReadDepartments(
        $filter: DepartmentFilterFields = {}
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readDepartments(filter: $filter, limit: $limit, offset: $offset) {
            nodes {
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
                basicComponents {
                    nodes {
                        id
                        title
                        componentCategory
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
    }
`
