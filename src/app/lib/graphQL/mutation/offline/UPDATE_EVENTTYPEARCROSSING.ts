import gql from 'graphql-tag'

export const UPDATE_EVENTTYPEARCROSSING = gql`
    mutation UpdateEventType_BarCrossing(
        $input: UpdateEventType_BarCrossingInput!
    ) {
        updateEventType_BarCrossing(input: $input) {
            id
        }
    }
`
