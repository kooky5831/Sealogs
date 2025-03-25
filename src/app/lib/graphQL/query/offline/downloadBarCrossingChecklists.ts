import gql from 'graphql-tag'

export const DownloadBarCrossingChecklists = gql`
    query DownloadBarCrossingChecklists($limit: Int = 100, $offset: Int = 0) {
        readBarCrossingChecklists(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                stopAssessPlan
                crewBriefing
                weather
                stability
                waterTightness
                lifeJackets
                lookoutPosted
                memberID
                vesselID
            }
        }
    }
`
