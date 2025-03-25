import gql from 'graphql-tag'

export const CreateEventType_BarCrossing = gql`
    mutation CreateEventType_BarCrossing(
        $input: CreateEventType_BarCrossingInput!
    ) {
        createEventType_BarCrossing(input: $input) {
            id
        }
    }
`
