import gql from 'graphql-tag'

export const UPDAE_TRIPREPORT_STOP = gql`
    mutation UpdateTripReport_Stop($input: UpdateTripReport_StopInput!) {
        updateTripReport_Stop(input: $input) {
            id
        }
    }
`
