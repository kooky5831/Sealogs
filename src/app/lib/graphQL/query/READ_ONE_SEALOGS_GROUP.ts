import gql from 'graphql-tag'

export const READ_ONE_SEALOGS_GROUP = gql`
    query ReadOneSeaLogsGroup($id: ID!) {
        readOneSeaLogsGroup(filter: { id: { eq: $id } }) {
            id
            code
            description
            title
            permissionCodes
            permissions(limit: 1000) {
                nodes {
                    id
                    groupID
                    code
                }
            }
            members {
                nodes {
                    id
                    firstName
                    surname
                }
            }
        }
    }
`
