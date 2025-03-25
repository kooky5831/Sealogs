import gql from 'graphql-tag'

export const CREATE_TRIPREPORT_STOP = gql`
    mutation CreateTripReport_Stop($input: CreateTripReport_StopInput!) {
        createTripReport_Stop(input: $input) {
            id
        }
    }
`
