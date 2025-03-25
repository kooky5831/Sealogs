import gql from 'graphql-tag'

export const UpdateBarCrossingChecklist = gql`
    mutation UpdateBarCrossingChecklist(
        $input: UpdateBarCrossingChecklistInput!
    ) {
        updateBarCrossingChecklist(input: $input) {
            id
        }
    }
`
