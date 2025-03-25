import gql from 'graphql-tag'

export const Supernumerary_LogBookEntrySection = gql`
    query GetSupernumerary_LogBookEntrySections($id: [ID]!) {
        readSupernumerary_LogBookEntrySections(filter: { id: { in: $id } }) {
            nodes {
                id
                archived
                firstName
                surname
                disclaimer {
                    id
                    disclaimerText
                }
                sectionSignature {
                    id
                    signatureData
                    member {
                        id
                        firstName
                        surname
                    }
                }
                logBookEntry {
                    id
                    vehicle {
                        id
                        title
                    }
                }
            }
        }
    }
`
