import gql from 'graphql-tag'

export const CREATE_TOWINGCHECKLIST = gql`
    mutation CreateTowingChecklist($input: CreateTowingChecklistInput!) {
        createTowingChecklist(input: $input) {
            id
        }
    }
`