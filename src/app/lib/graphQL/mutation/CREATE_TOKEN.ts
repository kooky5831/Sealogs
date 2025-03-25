import gql from 'graphql-tag'

export const CREATE_TOKEN = gql`
    mutation CreateToken($email: String!, $password: String!) {
        createToken(email: $email, password: $password) {
            token
            status
            member {
                firstName
                surname
                superAdmin
                id
                availableClients
            }
        }
    }
`
