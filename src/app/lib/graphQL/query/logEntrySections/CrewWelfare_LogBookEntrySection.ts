import gql from 'graphql-tag'

export const CrewWelfare_LogBookEntrySection = gql`
    query GetCrewWelfare_LogBookEntrySections($id: [ID]!) {
        readCrewWelfare_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
                fitness
                safetyActions
                waterQuality
                imSafe
            }
        }
    }
`
