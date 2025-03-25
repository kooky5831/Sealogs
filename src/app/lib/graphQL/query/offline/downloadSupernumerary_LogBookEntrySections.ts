import gql from 'graphql-tag'

export const DownloadSupernumerary_LogBookEntrySections = gql`
    query DownloadSupernumerary_LogBookEntrySections(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readSupernumerary_LogBookEntrySections(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                archived
                firstName
                surname
                supernumeraryID
                disclaimer {
                    id
                    disclaimerText
                }
                sectionSignature {
                    id
                    signatureData
                    member {
                        id
                        firstName
                        surname
                    }
                }
                logBookEntry {
                    id
                    vehicle {
                        id
                        title
                    }
                }
            }
        }
    }
`
