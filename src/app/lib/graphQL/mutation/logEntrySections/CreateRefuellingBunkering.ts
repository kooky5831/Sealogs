import gql from 'graphql-tag'

export const CreateRefuellingBunkering = gql`
    mutation CreateRefuellingBunkering(
        $input: CreateRefuellingBunkeringInput!
    ) {
        createRefuellingBunkering(input: $input) {
            id
        }
    }
`
