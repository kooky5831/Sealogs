import gql from 'graphql-tag'

export const UPDATE_USER = gql`
    mutation UpdateSeaLogsMember($input: UpdateSeaLogsMemberInput!) {
        updateSeaLogsMember(input: $input) {
            id
            client {
                useDepartment
            }
        }
    }
`
