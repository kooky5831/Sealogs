import gql from 'graphql-tag'

export const GET_MISSIONTIMELINE_BY_ID = gql`
    query GetMissionTimelineById($id: ID!) {
        readOneMissionTimeline(filter: { id: { eq: $id } }) {
            id
        }
    }
`