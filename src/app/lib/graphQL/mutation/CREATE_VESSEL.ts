import gql from 'graphql-tag'

export const CREATE_VESSEL = gql`
    mutation CreateVessel($input: CreateVesselInput!) {
        createVessel(input: $input) {
            id
        }
    }
`
