import gql from 'graphql-tag'

export const DeleteCrewMembers_LogBookEntrySections = gql`
    mutation DeleteCrewMembers_LogBookEntrySections($ids: [ID]!) {
        deleteCrewMembers_LogBookEntrySections(ids: $ids)
    }
`
