import gql from 'graphql-tag'

export const GET_FUEL_LOGBOOKENRYSECTION = gql`
    query GetFuelLogbookentrySectionById($id: ID!) {
        readOneFuel_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`