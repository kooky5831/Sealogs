import gql from 'graphql-tag'

export const CREATE_DANGEROUSGOOD = gql`
    mutation CreateDangerousGood(
        $input: CreateDangerousGoodInput!
    ) {
        createDangerousGood(input: $input) {
            id
        }
    }
`
