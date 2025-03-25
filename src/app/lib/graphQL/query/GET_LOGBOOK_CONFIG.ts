import gql from 'graphql-tag'

export const GET_LOGBOOK_CONFIG = gql`
    query GetConfig($id: ID!) {
        readOneCustomisedLogBookConfig(
            filter: { customisedLogBookID: { eq: $id } }
        ) {
            id
            title
            lastEdited
            customisedComponentCategories
            customisedLogBook {
                id
                title
            }
            customisedLogBookComponents {
                nodes {
                    id
                    title
                    active
                    sortOrder
                    subView
                    subViewTitle
                    subFields
                    customEntryType
                    componentClass
                    category
                    disclaimer {
                        id
                        disclaimerText
                    }
                    customisedComponentFields(
                        sort: { created: DESC }
                        limit: 500
                    ) {
                        pageInfo {
                            totalCount
                        }
                        nodes {
                            id
                            fieldName
                            status
                            sortOrder
                            description
                            customisedFieldTitle
                            customisedFieldType
                            customisedEngineTypes
                        }
                    }
                }
            }
            policies {
                nodes {
                    id
                    fileFilename
                    name
                    title
                }
            }
        }
    }
`
