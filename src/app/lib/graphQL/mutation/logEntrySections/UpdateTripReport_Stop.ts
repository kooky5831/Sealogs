import gql from 'graphql-tag'

export const UpdateTripReport_Stop = gql`
    mutation UpdateTripReport_Stop($input: UpdateTripReport_StopInput!) {
        updateTripReport_Stop(input: $input) {
            id
        }
    }
`
