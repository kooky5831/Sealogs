import gql from 'graphql-tag'

export const READ_PERMISSION_TYPES = gql`
    query {
        readPermissionTypes {
            code
            name
            category
            help
            sort
            default
        }
    }
`
