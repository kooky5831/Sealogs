import gql from 'graphql-tag'

export const UPDATE_BARCROSSINGCHECKLIST = gql`
    mutation UpdateBarCrossingChecklist(
        $input: UpdateBarCrossingChecklistInput!
    ) {
        updateBarCrossingChecklist(input: $input) {
            id
        }
    }
`
