import gql from 'graphql-tag'

export const SEALOGS_GROUP = gql`
    query {
        readSeaLogsGroups {
            nodes {
                id
                code
                description
                title
            }
        }
    }
`
