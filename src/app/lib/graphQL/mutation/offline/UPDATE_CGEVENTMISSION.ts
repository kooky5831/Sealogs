import gql from 'graphql-tag'

export const UPDATE_CGEVENTMISSION = gql`
    mutation UpdateCGEventMission($input: UpdateCGEventMissionInput!) {
        updateCGEventMission(input: $input) {
            id
        }
    }
`