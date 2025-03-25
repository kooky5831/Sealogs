import gql from 'graphql-tag'

export const CREATE_SEALOGS_GROUP = gql`
    mutation CreateSeaLogsGroup($input: CreateSeaLogsGroupInput!) {
        createSeaLogsGroup(input: $input) {
            id
            title
            description
            permissionCodes
            permissions(limit: 1000) {
                nodes {
                    id
                    code
                    groupID
                }
            }
        }
    }
`
