import gql from 'graphql-tag'

export const LOGIN = gql`
    mutation LOGIN($userName: String!, $password: String!) {
        login(password: $password, userName: $userName) {
            isSuccess
            data {
                jwt
                message
                refreshJWT
                tokenId
                userId
            }
        }
    }
`
