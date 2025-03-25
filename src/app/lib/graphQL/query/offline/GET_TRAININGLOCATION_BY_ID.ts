import gql from 'graphql-tag'

export const GET_TRAININGLOCATION_BY_ID = gql`
    query GetTrainingLocationById($id: ID!) {
        readOneTrainingLocation(filter: { id: { eq: $id } }) {
            id
        }
    }
`
