import gql from 'graphql-tag'

export const UPDATE_MISSIONTIMELINE = gql`
    mutation UpdateMissionTimeline($input: UpdateMissionTimelineInput!) {
        updateMissionTimeline(input: $input) {
            id
        }
    }
`