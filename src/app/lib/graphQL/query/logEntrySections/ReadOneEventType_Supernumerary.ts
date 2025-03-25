import gql from 'graphql-tag'

export const ReadOneEventType_Supernumerary = gql`
    query ReadOneEventType_Supernumerary($id: ID!) {
        readOneEventType_Supernumerary(filter: { id: { eq: $id } }) {
            id
            title
            totalGuest
            focGuest
            isBriefed
            briefingTime
            guestList {
                nodes {
                    id
                    firstName
                    surname
                    sectionSignature {
                        id
                        signatureData
                    }
                }
            }
        }
    }
`
