import gql from 'graphql-tag'

export const DownloadMaintenanceCheck_Signatures = gql`
    query DownloadMaintenanceCheck_Signatures(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readMaintenanceCheck_Signatures(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                signatureData
                memberID
                maintenanceCheckID
                lastEdited
            }
        }
    }
`
