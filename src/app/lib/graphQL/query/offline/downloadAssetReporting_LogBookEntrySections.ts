import gql from 'graphql-tag'

export const DownloadAssetReporting_LogBookEntrySections = gql`
    query DownloadAssetReporting_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readAssetReporting_LogBookEntrySections(
            limit: $limit
            offset: $offset
        ) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
            }
        }
    }
`
