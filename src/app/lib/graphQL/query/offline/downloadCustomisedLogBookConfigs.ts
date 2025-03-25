import gql from 'graphql-tag'

export const DownloadCustomisedLogBookConfigs = gql`
    query DownloadCustomisedLogBookConfigs(
        $limit: Int = 100
        $offset: Int = 0
    ) {
        readCustomisedLogBookConfigs(limit: $limit, offset: $offset) {
            pageInfo {
                totalCount
                hasNextPage
            }
            nodes {
                id
                title
                lastEdited
                customisedComponentCategories
                customisedLogBook {
                    id
                    title
                }
                customisedLogBookID
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
    }
`
