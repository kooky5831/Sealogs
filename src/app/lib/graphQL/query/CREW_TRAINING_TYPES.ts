import gql from 'graphql-tag'

export const CREW_TRAINING_TYPES = gql`
    query ReadTrainingTypes(
        $limit: Int = 100
        $offset: Int = 0
        $filter: TrainingTypeFilterFields = {}
    ) {
        readTrainingTypes(limit: $limit, offset: $offset, filter: $filter) {
            nodes {
                id
                title
                occursEvery
                highWarnWithin
                procedure
                mediumWarnWithin
                vessels {
                    nodes {
                        id
                        title
                    }
                }
            }
        }
    }
`
