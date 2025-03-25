import gql from 'graphql-tag'

export const CREATE_EVENTTYPEBARCROSSING = gql`
    mutation CreateEventType_BarCrossing(
        $input: CreateEventType_BarCrossingInput!
    ) {
        createEventType_BarCrossing(input: $input) {
            id
        }
    }
`
