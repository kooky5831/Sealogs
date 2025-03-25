import gql from 'graphql-tag'

export const UpdateMissionTimeline = gql`
    mutation UpdateMissionTimeline($input: UpdateMissionTimelineInput!) {
        updateMissionTimeline(input: $input) {
            id
        }
    }
`
