import gql from 'graphql-tag'

export const DownloadCustomisedComponentFields = gql`
    query DownloadCustomisedComponentFields(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readCustomisedComponentFields(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                fieldName
                status
                sortOrder
                description
                customisedFieldTitle
                customisedFieldType
                customisedEngineTypes
                customisedLogBookComponentID
            }
        }
    }
`
