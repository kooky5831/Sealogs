import gql from 'graphql-tag'

export const CrewTraining_LogBookEntrySection = gql`
    query GetCrewTraining_LogBookEntrySections($id: [ID]!) {
        readCrewTraining_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
                archived
                trainingType
                trainingLocation
                trainingSummary
                trainingTime
                migrated
                sectionSignature {
                    id
                    signatureData
                    member {
                        id
                        firstName
                        surname
                    }
                }
                createdBy {
                    id
                    firstName
                    surname
                }
                trainer {
                    id
                    firstName
                    surname
                }
                sectionMemberComments {
                    nodes {
                        id
                    }
                }
                members {
                    nodes {
                        id
                        firstName
                        surname
                    }
                }
                logBookEntry {
                    id
                    vehicle {
                        id
                        title
                    }
                }
            }
        }
    }
`
