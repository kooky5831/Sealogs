import gql from 'graphql-tag'

export const UPDATE_TOWINGCHECKLIST = gql`
    mutation UpdateTowingChecklist($input: UpdateTowingChecklistInput!) {
        updateTowingChecklist(input: $input) {
            id
        }
    }
`