import gql from 'graphql-tag'

export const CreateLogBookEntrySection_Signature = gql`
    mutation CreateLogBookEntrySection_Signature(
        $input: CreateLogBookEntrySection_SignatureInput!
    ) {
        createLogBookEntrySection_Signature(input: $input) {
            id
        }
    }
`
