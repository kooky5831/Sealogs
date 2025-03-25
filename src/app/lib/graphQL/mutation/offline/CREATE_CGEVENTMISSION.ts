import gql from 'graphql-tag'

export const CREATE_CGEVENTMISSION = gql`
    mutation CreateCGEventMission($input: CreateCGEventMissionInput!) {
        createCGEventMission(input: $input) {
            id
        }
    }
`