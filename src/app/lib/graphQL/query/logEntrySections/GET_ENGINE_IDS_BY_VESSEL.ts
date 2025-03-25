import gql from 'graphql-tag'

export const GET_ENGINE_IDS_BY_VESSEL = gql`
    query GET_ENGINE_IDS_BY_VESSEL($id: ID!) {
        readBasicComponents(
            filter: {
                parentComponent_Components: {
                    parentComponent: { id: { eq: $id } }
                }
                componentCategory: { eq: Engine }
            }
        ) {
            nodes {
                id
                title
                componentCategory
            }
        }
    }
`
