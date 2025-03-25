import gql from 'graphql-tag'

export const GET_VESSEL_CONFIG = gql`
    query GetLogBookConfiguration($vesselID: Int!) {
        getLogBookConfiguration(vesselID: $vesselID) {
            isSuccess
            data {
                ID
                Title
                ComponentConfig
                ClassName
                LastEdited
                LogBookConfig
            }
        }
    }
`
