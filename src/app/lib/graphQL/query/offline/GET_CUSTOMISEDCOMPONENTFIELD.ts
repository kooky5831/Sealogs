import gql from 'graphql-tag'

export const GET_CUSTOMISEDCOMPONENTFIELD = gql`
    query GetCustomisedComponentField( $id: ID!) {
        readOneCustomisedComponentField(filter: { id: { eq: $id } }) {
            id
        }
    }
`
