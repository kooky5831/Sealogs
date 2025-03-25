import gql from 'graphql-tag'

export const UPDATE_CREW_DUTY = gql`
    mutation UpdateCrewDuty($input: UpdateCrewDutyInput!) {
        updateCrewDuty(input: $input) {
            id
        }
    }
`
