import gql from 'graphql-tag'

export const CreateTowingChecklist = gql`
    mutation CreateTowingChecklist($input: CreateTowingChecklistInput!) {
        createTowingChecklist(input: $input) {
            id
        }
    }
`
