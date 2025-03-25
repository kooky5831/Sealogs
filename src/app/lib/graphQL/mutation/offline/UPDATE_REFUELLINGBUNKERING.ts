import gql from 'graphql-tag'

export const UPDATE_REFUELLINGBUNKERING = gql`
    mutation UpdateRefuellingBunkering(
        $input: UpdateRefuellingBunkeringInput!
    ) {
        updateRefuellingBunkering(input: $input) {
            id
        }
    }
`
