'use client'

import { useApolloClient } from '@apollo/client/react/hooks/useApolloClient'

export const UpdateAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
    const apolloClient = useApolloClient()
    if (typeof window !== 'undefined') {
        apolloClient.defaultContext.token = localStorage
            ?.getItem('sl-jwt')
            ?.toString()
    }
    return children
}
