import gql from 'graphql-tag'

export const CREATE_SEALOGS_FILE_LINKS = gql`
    mutation CreateSeaLogsFileLinks($input: CreateSeaLogsFileLinksInput!) {
        createSeaLogsFileLinks(input: $input) {
            id
            link
        }
    }
`
