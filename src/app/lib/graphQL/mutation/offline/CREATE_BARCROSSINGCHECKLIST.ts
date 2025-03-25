import gql from 'graphql-tag'

export const CREATE_BARCROSSINGCHECKLIST = gql`
    mutation CreateBarCrossingChecklist(
        $input: CreateBarCrossingChecklistInput!
    ) {
        createBarCrossingChecklist(input: $input) {
            id
        }
    }
`
