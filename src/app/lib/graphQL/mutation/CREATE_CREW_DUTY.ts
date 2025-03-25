import gql from 'graphql-tag'

export const CREATE_CREW_DUTY = gql`
    mutation CreateCrewDuty($input: CreateCrewDutyInput!) {
        createCrewDuty(input: $input) {
            id
        }
    }
`
