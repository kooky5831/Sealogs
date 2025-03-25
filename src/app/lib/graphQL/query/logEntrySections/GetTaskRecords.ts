import gql from 'graphql-tag'

export const GetTaskRecords = gql`
    query GetTaskRecords($id: ID!) {
        readMissionTimelines(
            filter: { maintenanceCheckID: { eq: $id }, archived: { eq: false } }
        ) {
            nodes {
                id
                time
                description
                subTaskID
                author {
                    id
                    firstName
                    surname
                }
            }
        }
    }
`
