import gql from 'graphql-tag'

export const UPDATE_DANGEROUSGOOD = gql`
    mutation UpdateDangerousGood(
        $input: UpdateDangerousGoodInput!
    ) {
        updateDangerousGood(input: $input) {
            id
        }
    }
`
