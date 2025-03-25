import gql from 'graphql-tag'

export const CreateBarCrossingChecklist = gql`
    mutation CreateBarCrossingChecklist(
        $input: CreateBarCrossingChecklistInput!
    ) {
        createBarCrossingChecklist(input: $input) {
            id
        }
    }
`
