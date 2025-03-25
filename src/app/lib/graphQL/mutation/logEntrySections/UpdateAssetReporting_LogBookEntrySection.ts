import gql from 'graphql-tag'

export const UpdateAssetReporting_LogBookEntrySection = gql`
    mutation updateAssetReporting_LogBookEntrySection(
        $input: UpdateAssetReporting_LogBookEntrySectionInput!
    ) {
        updateAssetReporting_LogBookEntrySection(input: $input) {
            id
        }
    }
`
