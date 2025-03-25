import gql from 'graphql-tag'

export const UPDATE_VESSEL = gql`
    mutation UpdateVessel($input: UpdateVesselInput!) {
        updateVessel(input: $input) {
            id
            documents {
                nodes {
                    id
                    fileFilename
                    name
                    title
                }
            }
        }
    }
`
