import gql from 'graphql-tag'

export const CreateAssetReporting_LogBookEntrySection = gql`
    mutation createAssetReporting_LogBookEntrySection(
        $input: CreateAssetReporting_LogBookEntrySectionInput!
    ) {
        createAssetReporting_LogBookEntrySection(input: $input) {
            id
        }
    }
`
