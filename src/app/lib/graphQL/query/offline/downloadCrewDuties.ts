import gql from 'graphql-tag'

export const DownloadCrewDuties = gql`
    query DownloadCrewDuties($limit: Int = 100, $offset: Int = 0) {
        readCrewDuties(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
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
