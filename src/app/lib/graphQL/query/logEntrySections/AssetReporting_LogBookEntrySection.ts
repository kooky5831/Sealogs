import gql from 'graphql-tag'

export const AssetReporting_LogBookEntrySection = gql`
    query readOneAssetReporting_LogBookEntrySection($id: ID!) {
        readOneAssetReporting_LogBookEntrySection(filter: { id: { eq: $id } }) {
            id
        }
    }
`
