import gql from 'graphql-tag'

export const GET_COMPONENTMAINTENANCECHECK_BY_ID = gql`
    query GetComponentMaintenanceCheckById( $id: ID!) {
        readOneComponentMaintenanceCheck(filter: { id: { eq: $id } }) {
            id
        }
    }
`
