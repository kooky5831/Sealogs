import gql from 'graphql-tag'

export const DELETE_CREW_DUTY = gql`
    mutation DeleteCrewDuties($ids: [ID]!) {
        deleteCrewDuties(ids: $ids)
    }
`
