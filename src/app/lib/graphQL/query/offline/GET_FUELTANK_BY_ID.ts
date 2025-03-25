import gql from 'graphql-tag'

export const GET_FUELTANK_BY_ID = gql`
    query Get_FuelTankById($id: ID!) {
        readOneFuelTank(filter: { id: { eq: $id } }) {
            id
        }
    }
`