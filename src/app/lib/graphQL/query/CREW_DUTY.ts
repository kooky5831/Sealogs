import gql from 'graphql-tag'

export const CREW_DUTY = gql`
    query {
        readCrewDuties {
            nodes {
                id
                title
                abbreviation
                archived
                clientID
                className
                lastEdited
            }
        }
    }
`
