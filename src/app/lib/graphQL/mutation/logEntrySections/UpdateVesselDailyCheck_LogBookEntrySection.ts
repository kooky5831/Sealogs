import gql from 'graphql-tag'

export const UpdateVesselDailyCheck_LogBookEntrySection = gql`
    mutation UpdateVesselDailyCheck_LogBookEntrySection(
        $input: UpdateVesselDailyCheck_LogBookEntrySectionInput!
    ) {
        updateVesselDailyCheck_LogBookEntrySection(input: $input) {
            id
        }
    }
`
