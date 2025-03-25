import gql from 'graphql-tag'

export const UpdateLogBookEntrySection_Signature = gql`
    mutation UpdateLogBookEntrySection_Signature(
        $input: UpdateLogBookEntrySection_SignatureInput!
    ) {
        updateLogBookEntrySection_Signature(input: $input) {
            id
        }
    }
`
