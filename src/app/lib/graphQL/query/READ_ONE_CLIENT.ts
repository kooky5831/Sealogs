import gql from 'graphql-tag'

export const READ_ONE_CLIENT = gql`
    query ReadOneClient($filter: ClientFilterFields) {
        readOneClient(filter: $filter) {
            id
            title
            phone
            adminEmail
            accountsEmail
            useDepartment
            masterTerm
            maritimeTrafficFleetEmail
            logoID
            iconLogoID
            hqAddress {
                id
                streetNumber
                street
                locality
                administrative1
                postalCode
                country
                timeZone
            }
            documents {
                nodes {
                    id
                    fileFilename
                    name
                    title
                    created
                }
            }
        }
    }
`
