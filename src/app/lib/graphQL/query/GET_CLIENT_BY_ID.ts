import gql from 'graphql-tag'

/* export const GET_CLIENT_BY_ID = gql`
  query GetClientByID($clientId: Int!) {
    getClientByID(clientID: $clientId) {
      isSuccess
      data {
        Title
      }
    }
  }
`; */

export const GET_CLIENT_BY_ID = gql`
    query GetClientById($clientIDs: [ID]) {
        readClients(filter: { id: { in: $clientIDs } }) {
            nodes {
                id
                title
            }
        }
    }
`
