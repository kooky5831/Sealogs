import gql from 'graphql-tag'

export const UpdateRefuellingBunkering = gql`
    mutation UpdateRefuellingBunkering(
        $input: UpdateRefuellingBunkeringInput!
    ) {
        updateRefuellingBunkering(input: $input) {
            id
        }
    }
`
