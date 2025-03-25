import gql from 'graphql-tag'

export const CreateTripReport_Stop = gql`
    mutation CreateTripReport_Stop($input: CreateTripReport_StopInput!) {
        createTripReport_Stop(input: $input) {
            id
        }
    }
`
