import gql from 'graphql-tag'

export const REQUEST_RESET_PASSWORD = gql`
    mutation RequestResetPassword($email: String!) {
        requestResetPassword(email: $email) {
            result
            message
        }
    }
`
