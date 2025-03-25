import gql from 'graphql-tag'

export const TRAINING_TYPE_BY_ID = gql`
    query GetOneTrainingType($id: ID!) {
        readOneTrainingType(filter: { id: { eq: $id } }) {
            id
            archived
            highWarnWithin
            mediumWarnWithin
            occursEvery
            procedure
            title
            trainingSessions {
                nodes {
                    id
                    date
                    vessel {
                        id
                        title
                    }
                }
            }
            vessels {
                nodes {
                    id
                    title
                }
            }
        }
    }
`
