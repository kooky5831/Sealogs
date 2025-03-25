import gql from 'graphql-tag'

export const UPDATE_SEALOGS_GROUP = gql`
    mutation UpdateSeaLogsGroup($input: UpdateSeaLogsGroupInput!) {
        updateSeaLogsGroup(input: $input) {
            id
            code
            description
            title
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
