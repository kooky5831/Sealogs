import gql from 'graphql-tag'

export const CREATE_VESSELDAILYCHECK_LOGBOOKENTRYSECTION = gql`
    mutation CreateVesselDailyCheck_LogBookEntrySection(
        $input: CreateVesselDailyCheck_LogBookEntrySectionInput!
    ) {
        createVesselDailyCheck_LogBookEntrySection(input: $input) {
            id
        }
    }
`