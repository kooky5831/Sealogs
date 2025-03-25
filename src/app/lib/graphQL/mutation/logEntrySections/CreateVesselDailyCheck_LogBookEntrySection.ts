import gql from 'graphql-tag'

export const CreateVesselDailyCheck_LogBookEntrySection = gql`
    mutation CreateVesselDailyCheck_LogBookEntrySection(
        $input: CreateVesselDailyCheck_LogBookEntrySectionInput!
    ) {
        createVesselDailyCheck_LogBookEntrySection(input: $input) {
            id
        }
    }
`
