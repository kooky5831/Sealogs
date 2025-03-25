import gql from 'graphql-tag'

export const UpdateTowingChecklist = gql`
    mutation UpdateTowingChecklist($input: UpdateTowingChecklistInput!) {
        updateTowingChecklist(input: $input) {
            id
        }
    }
`
