import gql from 'graphql-tag'

export const UpdateCGEventMission = gql`
    mutation UpdateCGEventMission($input: UpdateCGEventMissionInput!) {
        updateCGEventMission(input: $input) {
            id
        }
    }
`
