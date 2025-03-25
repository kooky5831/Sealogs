import gql from 'graphql-tag'

export const GET_FUELLOG_BY_ID = gql`
    query Get_FuelLogById($id: ID!) {
        readOneFuelLog(filter: { id: { eq: $id } }) {
            id
        }
    }
`