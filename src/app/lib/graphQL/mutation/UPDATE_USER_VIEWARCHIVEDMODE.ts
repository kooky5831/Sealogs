import gql from 'graphql-tag'

export const UPDATE_USER_VIEWARCHIVEDMODE = gql`
    mutation UpdateUserViewArchivedMode($id: Int!, $viewArchivedMode: Int) {
        updateUserViewArchivedMode(
            id: $id
            viewArchivedMode: $viewArchivedMode
        ) {
            isSuccess
            data
        }
    }
`
