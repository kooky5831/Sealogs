import gql from 'graphql-tag'

export const CreateDepartment = gql`
    mutation CreateDepartment($input: CreateDepartmentInput!) {
        createDepartment(input: $input) {
            id
        }
    }
`
