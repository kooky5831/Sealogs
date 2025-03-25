import gql from 'graphql-tag'

export const CreateMissionTimeline = gql`
    mutation CreateMissionTimeline($input: CreateMissionTimelineInput!) {
        createMissionTimeline(input: $input) {
            id
        }
    }
`
