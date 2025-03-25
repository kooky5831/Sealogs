import gql from 'graphql-tag'

export const UpdateDepartment = gql`
    mutation UpdateDepartment($input: UpdateDepartmentInput!) {
        updateDepartment(input: $input) {
            id
        }
    }
`
