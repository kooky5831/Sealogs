import gql from 'graphql-tag'

export const UpdateEventType_BarCrossing = gql`
    mutation UpdateEventType_BarCrossing(
        $input: UpdateEventType_BarCrossingInput!
    ) {
        updateEventType_BarCrossing(input: $input) {
            id
        }
    }
`
