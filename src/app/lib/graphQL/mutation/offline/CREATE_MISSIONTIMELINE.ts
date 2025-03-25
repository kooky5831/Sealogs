import gql from 'graphql-tag'

export const CREATE_MISSIONTIMELINE = gql`
    mutation CreateMissionTimeline($input: CreateMissionTimelineInput!) {
        createMissionTimeline(input: $input) {
            id
        }
    }
`