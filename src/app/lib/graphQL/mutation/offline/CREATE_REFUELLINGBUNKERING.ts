import gql from 'graphql-tag'

export const CREATE_REFUELLINGBUNKERING = gql`
    mutation CreateRefuellingBunkering(
        $input: CreateRefuellingBunkeringInput!
    ) {
        createRefuellingBunkering(input: $input) {
            id
        }
    }
`
