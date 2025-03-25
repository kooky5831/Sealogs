import gql from 'graphql-tag'

export const DELETE_SEALOGS_GROUP = gql`
    mutation DeleteSeaLogsGroups($ids: [ID]!) {
        deleteSeaLogsGroups(ids: $ids)
    }
`
