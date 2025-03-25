import gql from 'graphql-tag'

export const CREATE_VESSEL_SPECIFICS = gql`
    mutation CreateVesselSpecifics($input: CreateVesselSpecificsInput!) {
        createVesselSpecifics(input: $input) {
            id
        }
    }
`
