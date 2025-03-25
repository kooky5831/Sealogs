import gql from 'graphql-tag'
import { constant } from 'lodash'

export const GET_CREW_DUTY_BY_ID = gql`
    query GetCrewDuty($id: ID!) {
        readOneCrewDuty(filter: { id: { eq: $id } }) {
            id
            title
            abbreviation
            archived
            clientID
            className
            lastEdited
        }
    }
`
