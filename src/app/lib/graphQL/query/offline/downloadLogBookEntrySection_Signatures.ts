import gql from 'graphql-tag'

export const DownloadLogBookEntrySection_Signatures = gql`
    query DownloadLogBookEntrySection_Signatures(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readLogBookEntrySection_Signatures(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                className
                signatureData
                memberID
                logBookEntrySectionID
                lastEdited
            }
        }
    }
`
