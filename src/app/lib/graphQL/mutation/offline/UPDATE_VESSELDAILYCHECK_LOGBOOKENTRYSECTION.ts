import gql from 'graphql-tag'

export const UPDATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION = gql`
    mutation UpdateVesselDailyCheck_LogBookEntrySection(
        $input: UpdateVesselDailyCheck_LogBookEntrySectionInput!
    ) {
        updateVesselDailyCheck_LogBookEntrySection(input: $input) {
            id
        }
    }
`