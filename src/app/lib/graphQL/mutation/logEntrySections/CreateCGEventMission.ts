import gql from 'graphql-tag'

export const CreateCGEventMission = gql`
    mutation CreateCGEventMission($input: CreateCGEventMissionInput!) {
        createCGEventMission(input: $input) {
            id
        }
    }
`
