import gql from 'graphql-tag'

export const DownloadConsequences = gql`
    query DownloadConsequences($limit: Int = 100, $offset: Int = 0) {
        readConsequences(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                name
                humanInjury
                financialCost
                workIncomeReputation
                environment
                backgroundColour
                textColour
                number
            }
        }
    }
`
