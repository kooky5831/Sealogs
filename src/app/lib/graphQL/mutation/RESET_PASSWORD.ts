import gql from 'graphql-tag'

export const RESET_PASSWORD = gql`
    mutation ResetPassword(
        $token: String!
        $password: String!
        $passwordConfirm: String!
    ) {
        resetPassword(
            token: $token
            password: $password
            passwordConfirm: $passwordConfirm
        ) {
            result
            message
        }
    }
`
